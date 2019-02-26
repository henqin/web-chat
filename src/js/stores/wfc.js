import { observable, action} from 'mobx';
import proto from 'node-loader!../../../node_modules/marswrapper.node';
import TextMessageContent from '../wfc/messages/textMessageContent'
import * as wfcMessage from '../wfc/messageConfig'
import Message from '../wfc/messages/message';
import Conversation from '../wfc/conversation';


class WfcManager {
    @observable connectionStatus = 0;
    @observable userId = '';
    @observable token = '';

    onReceiveMessageListeners = [];

    messageContentList = new Map();

    @action onConnectionChanged(status){
        self.connectionStatus = status;
        console.log('status', status);
    }
    onReceiveMessage(messages, hasMore){
        var msgs = JSON.parse(messages);
        console.log('on ReceiveMessage');
        console.log(messages, hasMore);
        msgs.map(m => {
            self.onReceiveMessageListeners.forEach(listener => {
                let msg = Object.assign(new Message(), m);
                let contentClazz = wfcMessage.getMessageContentClazz(msg.content.type);
                if(contentClazz ){
                    console.log(contentClazz);
                    let content = new contentClazz();
                    content.decode(msg.content);
                    msg.content = content;
                }else{
                    console.error('message content not register', m);
                }
                listener(msg, hasMore);
            });
        });
    }

    async init(){
        proto.setConnectionStatusListener(self.onConnectionChanged);
        proto.setReceiveMessageListener(self.onReceiveMessage);
        self.registerDefaultMessageContents();


        // var json = '{"base":"jjjjjjjjj", "name":"indx", "content":"hello world content"}'
        // // let test = Object.assign(new self.abc(), JSON.parse(json));
        // console.log('test import');
        // var xxx = TextMessageContent;
        // var test = new xxx();

        // test.decode(json);

        // console.log(test.content);
        // console.log(test.base);

        // var json = '    { "conversation":{ "conversationType": 0, "target": "UZUWUWuu", "line": 0 }, "from": "UZUWUWuu", "content": { "type": 1, "searchableContent": "1234", "pushContent": "", "content": "", "binaryContent": "", "localContent": "", "mediaType": 0, "remoteMediaUrl": "", "localMediaPath": "", "mentionedType": 0, "mentionedTargets": [ ] }, "messageId": 52, "direction": 1, "status": 5, "messageUid": 75735276990792720, "timestamp": 1550849394256, "to": "" } ';
        // let msg = Object.assign(new Message(), JSON.parse(json));
        // let contentClazz = wfcMessage.getMessageContentClazz(msg.content.type);
        // let text = new contentClazz();
        // text.decode(msg.content);
        // console.log(text.content);
        // console.log(text instanceof TextMessageContent);
        // console.log(msg.from);
        // console.log(msg.content);

        let c1 = new Conversation();
        c1.target = 'target';
        c1.conversationType = 0;
        c1.line = 0;

        let c2 = new Conversation();
        c2.target = 'target';
        c2.conversationType = 0;
        c2.line = 0;

        console.log('conversation is same: ', _.isEqual(c1, c2));
    }

    /**
     * 
     * @param {messagecontent} content 
     */
    registerMessageContent(type, content){
        self.messageContentList[type] = content; 
    }

    async setServerAddress(host, port){
        proto.setServerAddress("wildfirechat.cn", 80);
    }

    async connect(userId, token){
        proto.connect(userId, token);
    }

    registerDefaultMessageContents(){
        wfcMessage.MessageContents.map((e)=>{
            proto.registerMessageFlag(e.type, e.flag);
            self.registerMessageContent(e.type, e.content);
        });
    }

    /**
     * 
     * @param {function} listener 
     */
    setOnReceiveMessageListener(listener){
        if (typeof listener !== 'function'){
            console.log('listener should be a function');
            return;
        }
        self.onReceiveMessageListeners.forEach(l => {
            l === listener
            return
        });
        self.onReceiveMessageListeners.push(listener);
    }

    removeOnReceiMessageListener(listener){
        if (typeof listener !== 'function'){
            console.log('listener should be a function');
            return;
        }
        self.onReceiveMessageListeners.splice(self.onReceiveMessageListeners.indexOf(listener), 1);
    }

    @action async getConversationList(types, lines){
        var conversationListStr = proto.getConversationInfos(types, lines);
        console.log(conversationListStr);
        return JSON.parse(conversationListStr);
    }

    @action async getConversation(type, target, line = 0){

    }

    /**
     * 
     * @param {Conversation} conversation
     * @param {number} fromIndex 
     * @param {boolean} before 
     * @param {number} count 
     * @param {string} withUser 
     */
    @action async getMessageList(conversation, fromIndex, before, count, withUser){
        return [];
    }

    @action async getMessageById(messageId){

    }
    
    @action async getMessageByUid(messageUid){

    }

    @action async getUserInfo(userId){

    }

    async sendTextMessage(type, target, line, to, text){

    }

    async sendMessage(message){
        // let conv = {conversationType:0,target:'5O5J5JOO',line:0}
        let strConv = JSON.stringify(message.conversation);
        // let strCont = '{"type":1,"searchableContent":"hello","pushContent":"","content":"","binaryContent":"","localContent":"","mediaType":0,"remoteMediaUrl":"","localMediaPath":"","mentionedType":0,"mentionedTargets":[]}';
        let strContt = JSON.stringify(message.payload);
        let retValue = proto.sendMessage(strConv, strCont, "", 0, function(messageId, timestamp) { //preparedCB
          console.log("sendMessage prepared:", messageId, timestamp);
        }, function(uploaded, total) { //progressCB
          console.log("sendMessage progress:", uploaded, total);
        }, function(messageUid, timestamp) { //successCB
          console.log("sendMessage success:", messageUid, timestamp);
        }, function(errorCode) { //errorCB
          console.log("sendMessage failed:", errorCode);
        });
        console.log("call sendMessage return:", retValue);
    }
}
const self = new WfcManager();
export default self;