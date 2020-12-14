import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { CometChat } from "@cometchat-pro/chat";

import { CometChatManager } from "../../util/controller";
import * as enums from '../../util/enums.js';

import NavBar from "./NavBar";
import CometChatMessageListScreen from "../CometChatMessageListScreen";
import CometChatUserDetail from "../CometChatUserDetail";
import CometChatGroupDetail from "../CometChatGroupDetail";
import CometChatUserMessageDetail from "../CometChatUserMessageDetail";
import CometChatGroupMessageDetail from "../CometChatGroupMessageDetail";
import MessageThread from "../MessageThread";
import CallAlert from "../CallAlert";
import CallScreen from "../CallScreen";

import { theme } from "../../resources/theme";

import {
  unifiedStyle,
  unifiedSidebarStyle,
  unifiedMainStyle,
  unifiedSecondaryStyle,
  unifiedWPMainStyle
} from "./style";
import axios from 'axios';
import { convertNodeToElement } from "react-html-parser";
import { COMETCHAT_CONSTANTS, COMETCHAT_VARS, WP_API_CONSTANTS, WP_API_ENDPOINTS_CONSTANTS } from '../../../../consts';

class CometChatUnified extends React.Component {

  loggedInUser = null;

  constructor(props) {
    
    super(props);

    this.state = {
      darktheme: false,
      viewdetailscreen: false,
      viewMessagedetailscreen: false,
      item: {},
      type: "user",
      tab: "rooms",
      roomUpdating: false,
      callStatus:true,
      groupToDelete: {},
      groupToLeave: {},
      groupToUpdate: {},
      threadmessageview: false,
      threadmessagetype: null,
      threadmessageitem: {},
      threadmessageparent: {},
      composedthreadmessage: {},
      incomingCall: null,
      outgoingCall: null,
      messageToMarkRead: {},
      callmessage: {},
      lastmessage: {},
      sidebarview: false,
      isRoomShow: true
    }

    this.theme = Object.assign({}, theme, this.props.theme);
	}
  
   componentDidMount() {
    if( COMETCHAT_CONSTANTS.MODE == COMETCHAT_VARS.CHAT_MODE_NBR ) {
      if( WP_API_CONSTANTS.ENABLE_ROOM == "" ){
        this.setState({ tab: 'contacts', type: 'user', isRoomShow: false });
      }else{

      }
    //  this.getrooms();
    }else{
      let groupItem =   {
        "table_name": WP_API_CONSTANTS.WP_TABLE_NAME,
        "name": WP_API_CONSTANTS.WP_TABLE_NAME,
        "membersCount": WP_API_CONSTANTS.WP_TABLE_USERS.length,
        'scope': CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT,
        "guid": WP_API_CONSTANTS.WP_TABLE_ID,
        "table_id": WP_API_CONSTANTS.WP_TABLE_ID,
        "table_users": WP_API_CONSTANTS.WP_TABLE_USERS,
      };
      this.setState({ type: "group", item: groupItem});
      
    }
    const activeCall = CometChat.getActiveCall();
    if(!Object.keys(this.state.item).length) {
      this.toggleSideBar();
    }

    new CometChatManager().getLoggedInUser().then((user) => {
      this.loggedInUser = user;

    }).catch((error) => {
      console.log("[CometChatUnified] getLoggedInUser error", error);
    });
  }

  getrooms = () => {
    // setTimeout(() => {
    if( this.state.tab  == 'rooms' ){
      let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.GET_CHATROOM}`;
      axios.get( api_url, {
        params: {
          user_id: WP_API_CONSTANTS.WP_USER_ID
        }
      }).then(roomList => {
        if( roomList.data.length == 0 ){
            this.setState({ tab: 'contacts', type: 'user', isRoomShow: false });
        }else{
          
        }
      });
    }
  // }, 1000); 
  }

  changeTheme = (e) => {
    this.setState({
      darktheme: !this.state.darktheme
    })
  }

  navBarAction = (action, type, item) => {
    switch(action) {
      case "itemClicked":
        this.itemClicked(item, type);
      break;
      case "tabChanged":
        this.tabChanged(type);
      break;
      case "closeMenuClicked":
        this.toggleSideBar();
      break;
      default:
      break;
    }
  }
  
  itemClicked = (item, type) => {
    // console.log(item);
    if( type.roomUpdated == true ){
      this.setState({ item: {...item}, type: type.type, viewdetailscreen: false, roomUpdating: type.roomUpdated });
      this.toggleSideBar();
      this.setState({ item: {...item}, type: type.type, viewdetailscreen: false });
    }else{
      this.setState({ item: {...item}, type, viewdetailscreen: false });
      this.toggleSideBar();
      this.setState({ item: {...item}, type, viewdetailscreen: false });
    }
    
  }

  tabChanged = (tab) => {

    this.setState({tab});
    this.setState({viewdetailscreen: false});
  }

  actionHandler = (action, item, count, ...otherProps) => {
    
    switch(action) {
      case "blockUser":
        this.blockUser();
      break;
      case "unblockUser":
        this.unblockUser();
      break;
      case "audioCall":
        this.audioCall();
      break;
      case "videoCall":
        this.videoCall();
      break;
      case "joinAudioCall":
        this.joinAudioCall(item);
      break;
      case "joinVideoCall":
        this.joinVideoCall(item);
      break;
      case "viewDetail":
      case "closeDetailClicked":
        this.toggleDetailView();
      break;
      case "viewMessageDetail":
      case "closeMessageDetailClicked":
        this.toggleMessageDetailView();
      break;
      // eslint-disable-next-line no-lone-blocks
      case "menuClicked": {
        this.toggleSideBar();
        this.setState({ item: {} });
      }
      break;
      case "groupUpdated":
        this.groupUpdated(item, count, ...otherProps);
      break;
      case "groupDeleted": 
        this.deleteGroup(item);
      break;
      case "leftGroup":
        this.leaveGroup(item);
      break;
      case "membersUpdated":
        this.updateMembersCount(item, count);
      break;
      case "viewMessageThread":
        this.viewMessageThread(item);
      break;
      case "closeThreadClicked":
        this.closeThreadMessages();
      break;
      case "threadMessageComposed":
        this.onThreadMessageComposed(item);
        break;
      case "acceptIncomingCall":
        this.acceptIncomingCall(item);
        break;
      case "acceptedIncomingCall":
        this.callInitiated(item);
        break;
      case "rejectedIncomingCall":
        this.rejectedIncomingCall(item, count);
        break;
      case "outgoingCallRejected":
        this.setState({ outgoingCall: null, incomingCall: null, viewMessagedetailscreen: false });
        break;
      case "outgoingCallCancelled":
      case "callEnded":
        this.outgoingCallEnded(item, ...otherProps);
        break;
      case "userJoinedCall":
      case "userLeftCall":
        this.appendCallMessage(item);
        break;
      case "itemClicked":
          this.itemClicked(item, ...otherProps);
        break;
      case "messageComposed": 
      case "messageEdited":
      case "messageDeleted":
          this.updateLastMessage(item[0]);
        break;
        default:
        break;
    }
  }

  blockUser = () => {

    let usersList = [this.state.item.uid];
    CometChatManager.blockUsers(usersList).then(list => {

        this.setState({item: {...this.state.item, blockedByMe: true}});

    }).catch(error => {
      console.log("Blocking user fails with error", error);
    });
  }

  unblockUser = () => {
    
    let usersList = [this.state.item.uid];
    CometChatManager.unblockUsers(usersList).then(list => {

        this.setState({item: {...this.state.item, blockedByMe: false}});

      }).catch(error => {
      console.log("unblocking user fails with error", error);
    });
  }

  audioCall = () => {
    // console.log(this.state.type);
    let receiverId, receiverType;
    if(this.state.type === "user") {

      receiverId = this.state.item.uid;
      receiverType = CometChat.RECEIVER_TYPE.USER;

    } else if(this.state.type === "group") {

      receiverId = this.state.item.guid;
      receiverType = CometChat.RECEIVER_TYPE.GROUP;
    }

    CometChatManager.call(receiverId, receiverType, CometChat.CALL_TYPE.AUDIO).then(outgoingCall => {

      this.appendCallMessage(outgoingCall);
      this.setState({ outgoingCall: outgoingCall });

    }).catch(error => {

      console.log("Call initialization failed with exception:", error);
    });

  }

  videoCall = () => {
    // console.log(this.state.item);
    let receiverId, receiverType;
    if(this.state.type === "user") {

      receiverId = this.state.item.uid;
      receiverType = CometChat.RECEIVER_TYPE.USER;

    } else if(this.state.type === "group") {
      receiverId = this.state.item.table_id;
      receiverType = CometChat.RECEIVER_TYPE.GROUP;
    }
   
    CometChatManager.call(receiverId, receiverType, CometChat.CALL_TYPE.VIDEO).then(outgoingCall => {

      this.appendCallMessage(outgoingCall);
      this.setState({ outgoingCall: outgoingCall });

    }).catch(error => {
      console.log("", error);
    });

  }

  joinVideoCall = (call1) => {
    // alert("asfdasfd");
    let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKCALL}`;
    // id.split(" ");
    // console.log(this.state.item);
    axios.post( api_url , {
      user_id: WP_API_CONSTANTS.WP_USER_ID,
      guid: this.state.item.guid,
      ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
      }
  ).then(res => {
      const call = res.data.data;
      if( res.data.msg == "Call json not found!" ){
        this.setState({ outgoingCall: null, incomingCall: null, viewMessagedetailscreen: false, callStatus: true });
        // this.appendCallMessage(message);
        alert("Call ended");
      }else if( !call ){
        // alert("asfdasfd");
        this.setState({ incomingCall: call });
      }else{
        let api_status_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKSTATUSCALL}`;
        axios.post( api_status_url , {
            user_id: WP_API_CONSTANTS.WP_USER_ID,
            guid: this.state.item.guid,
            ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
            session_call_id: call.sessionId
        }).then(status_res => {
          const status_call = status_res.data;
          if( status_res.data.success == false ){
            let api_endcall_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_ENDCALL}`;
              axios.post( api_endcall_url , {
                  user_id: WP_API_CONSTANTS.WP_USER_ID,
                  guid: this.state.item.guid,
                  ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
              }).then(end_res => {
              });
          }else{
            this.setState({ incomingCall: call });

            const type = this.state.incomingCall.receiverType;
            const id = (type === "user") ? this.state.incomingCall.sender.uid : this.state.incomingCall.receiverId;
            const globalStateContext = React.createContext(call);
            CometChat.getConversation(id, type).then(conversation => {
              this.itemClicked(conversation.conversationWith, type);
            }).catch(error => {
              console.log('error while fetching a conversation', error);
            });
          }
          
        });
      }
      
    });
  }

  joinAudioCall = (call1) => {
    let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKCALL}`;
    // id.split(" ");
    axios.post( api_url , {
      user_id: WP_API_CONSTANTS.WP_USER_ID,
      guid: this.state.item.guid,
      ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
      }
  ).then(res => {
      const call = res.data.data;
      if( !call ){
        this.setState({ incomingCall: call });
      }else{
        let api_status_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKSTATUSCALL}`;
        axios.post( api_status_url , {
            user_id: WP_API_CONSTANTS.WP_USER_ID,
            guid: this.state.item.guid,
            ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
            session_call_id: call.sessionId
        }).then(status_res => {
          const status_call = status_res.data;
          if( status_res.data.succeaa == false ){
            let api_endcall_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_ENDCALL}`;
              axios.post( api_endcall_url , {
                  user_id: WP_API_CONSTANTS.WP_USER_ID,
                  guid: this.state.item.guid,
                  ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
              }).then(end_res => {
              });
          }else{
            this.setState({ incomingCall: call });

            const type = this.state.incomingCall.receiverType;
            const id = (type === "user") ? this.state.incomingCall.sender.uid : this.state.incomingCall.receiverId;
            const globalStateContext = React.createContext(call);
            CometChat.getConversation(id, type).then(conversation => {
              this.itemClicked(conversation.conversationWith, type);
            }).catch(error => {
              console.log('error while fetching a conversation', error);
            });
          }
          
        });
      }
      
    });
    
  }


  toggleDetailView = () => {
    let viewdetail = !this.state.viewdetailscreen;
    this.setState({viewdetailscreen: viewdetail,  threadmessageview: false});
  }

  toggleMessageDetailView = () => {
    let viewmessagedetail = !this.state.viewMessagedetailscreen;
    this.setState({viewMessagedetailscreen: viewmessagedetail,  threadmessageview: false});
  }

  toggleSideBar = () => {
    const sidebarview = this.state.sidebarview;
    this.setState({ sidebarview: !sidebarview });
  }

  closeThreadMessages = () => {
    this.setState({viewdetailscreen: false, threadmessageview: false});
  }

  viewMessageThread = (parentMessage) => {

    const message = {...parentMessage};
    const threaditem = {...this.state.item};
    this.setState({
      threadmessageview: true, 
      threadmessageparent: message, 
      threadmessageitem: threaditem,
      threadmessagetype: this.state.type, 
      viewdetailscreen: false
    });
  }

  onThreadMessageComposed = (composedMessage) => {

    if(this.state.type !== this.state.threadmessagetype) {
      return false;
    }

    if((this.state.threadmessagetype === "group" && this.state.item.guid !== this.state.threadmessageitem.guid)
    || (this.state.threadmessagetype === "user" && this.state.item.uid !== this.state.threadmessageitem.uid)) {
      return false;
    }

    const message = {...composedMessage};
    this.setState({composedthreadmessage: message});
  }

  deleteGroup = (group) => {
    this.setState({groupToDelete: group, item: {}, type: "group", viewdetailscreen: false});
  }

  leaveGroup = (group) => {
    this.setState({groupToLeave: group, item: {}, type: "group", viewdetailscreen: false});
  }

  updateMembersCount = (item, count) => {

    const group = Object.assign({}, this.state.item, {membersCount: count});
    this.setState({item: group, groupToUpdate: group});
  }

  groupUpdated = (message, key, group, options) => {
    switch(key) {
      case enums.GROUP_MEMBER_BANNED:
      case enums.GROUP_MEMBER_KICKED: {
        
        if(options.user.uid === this.loggedInUser.uid) {
          this.setState({item: {}, type: "group", viewdetailscreen: false});
        }
        break;
      }
      case enums.GROUP_MEMBER_SCOPE_CHANGED: {
        
        if(options.user.uid === this.loggedInUser.uid) {

          const newObj = Object.assign({}, this.state.item, {"scope": options["scope"]})
          this.setState({item: newObj, type: "group", viewdetailscreen: false});
        }
        break;
      }
      default:
      break;
    }
  }


  acceptIncomingCall = (call) => {
    // console.log(this.props.item);
    this.setState({ incomingCall: call });
    // console.log("call accept");
    const type = call.receiverType;
    const id = (type === "user") ? call.sender.uid : call.receiverId;
    CometChat.getConversation(id, type).then(conversation => {
      let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_STARTCALL}`;
      if( type === "group" ){
        const user = {
          user_id: WP_API_CONSTANTS.WP_USER_ID,
          guid: call.receiverId,
          ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
          json_data: call
        };
        axios.post( api_url , user ).then(res => {
          // console.log(res);
          // console.log(conversation.conversationWith);
          this.itemClicked(conversation.conversationWith, type);
        });
      }else{
        // console.log(conversation.conversationWith);
        this.itemClicked(conversation.conversationWith, type);
      }  
    }).catch(error => {
      console.log('error while fetching a conversation', error);
    });

  }

  callInitiated = (message) => {
    this.appendCallMessage(message);
  }

  rejectedIncomingCall = (incomingCallMessage, rejectedCallMessage) => {

    let receiverType = incomingCallMessage.receiverType;
    let receiverId = (receiverType === "user") ? incomingCallMessage.sender.uid : incomingCallMessage.receiverId;

    //marking the incoming call message as read
    if (incomingCallMessage.hasOwnProperty("readAt") === false) {
      CometChat.markAsRead(incomingCallMessage.id, receiverId, receiverType);
    }

    //updating unreadcount in chats list
    this.setState({ messageToMarkRead: incomingCallMessage });

    let item = this.state.item;
    let type = this.state.type;

    receiverType = rejectedCallMessage.receiverType; 
    receiverId = rejectedCallMessage.receiverId;

    if ((type === 'group' && receiverType === 'group' && receiverId === item.guid)
      || (type === 'user' && receiverType === 'user' && receiverId === item.uid)) {

      this.appendCallMessage(rejectedCallMessage);
    }
  }

  outgoingCallEnded = (message, callStatus) => {
    this.setState({ outgoingCall: null, incomingCall: null, viewMessagedetailscreen: false, callStatus: callStatus });
    this.appendCallMessage(message);
  }

  appendCallMessage = (call) => {
    this.setState({ callmessage: call });
  }
  
  updateLastMessage = (message) => {
    this.setState({ lastmessage: message });
  }

  render() {
    let messageScreen = null;
    let navScreen = null;
    if( COMETCHAT_CONSTANTS.MODE == COMETCHAT_VARS.CHAT_MODE_NBR ) {
      
      // console.log(this.state.item);
      // if( this.state.tab === "rooms" && this.state.item == '' && this.props.state.length == "undefined" ){
      //   this.setState({ tab: 'user', type: 'user', isRoomShow: false });
      // }
      navScreen = (
        <div css={unifiedSidebarStyle(this.state, this.theme)}>
          <NavBar 
          theme={this.theme}
          type={this.state.type}
          item={this.state.item}
          tab={this.state.tab}
          isRoomShow={this.state.isRoomShow}
          roomUpdate={this.state.roomUpdating}
          groupToDelete={this.state.groupToDelete}
          lastMessage={this.state.lastmessage}
          groupToLeave={this.state.groupToLeave}
          groupToUpdate={this.state.groupToUpdate}
          messageToMarkRead={this.state.messageToMarkRead}
          actionGenerated={this.navBarAction}
          enableCloseMenu={Object.keys(this.state.item).length} />
        </div>
      );
    }else{
      
    }
    if(Object.keys(this.state.item).length) {
      if( COMETCHAT_CONSTANTS.MODE == COMETCHAT_VARS.CHAT_MODE_NBR ) {
        messageScreen = (
          <div css={unifiedMainStyle(this.state)}>
            <CometChatMessageListScreen 
            theme={this.theme}
            item={this.state.item} 
            tab={this.state.tab}
            type={this.state.type}
            callStatus={this.state.callStatus}
            composedthreadmessage={this.state.composedthreadmessage}
            callmessage={this.state.callmessage}
            loggedInUser={this.loggedInUser}
            actionGenerated={this.actionHandler} />
          </div>
        );
       
      }else{
        messageScreen = (
          <div css={unifiedWPMainStyle(this.state)}>
            <CometChatMessageListScreen 
            theme={this.theme}
            item={this.state.item} 
            tab={this.state.tab}
            type={this.state.type}
            callStatus={this.state.callStatus}
            composedthreadmessage={this.state.composedthreadmessage}
            callmessage={this.state.callmessage}
            loggedInUser={this.loggedInUser}
            actionGenerated={this.actionHandler} />
          </div>
        );
      }
      
    }
    
    let threadMessageView = null;
    if(this.state.threadmessageview) {
      threadMessageView = (
        <div css={unifiedSecondaryStyle(this.theme)}>
          <MessageThread
          theme={this.theme}
          tab={this.state.tab}
          item={this.state.threadmessageitem}
          type={this.state.threadmessagetype}
          parentMessage={this.state.threadmessageparent}
          actionGenerated={this.actionHandler} />
        </div>
      );
    }
    let detailScreen = null;
    if(this.state.viewdetailscreen) {

      if(this.state.type === "user") {

        detailScreen = (
          <div css={unifiedSecondaryStyle(this.theme)}>
            <CometChatUserDetail
              theme={this.theme}
              item={this.state.item} 
              type={this.state.type}
              actionGenerated={this.actionHandler} />
          </div>
          );
      } else if (this.state.type === "group") {
        if( COMETCHAT_CONSTANTS.MODE ==  COMETCHAT_VARS.CHAT_MODE_NBR ) {
          detailScreen = (
            <div css={unifiedSecondaryStyle(this.theme)}>
              <CometChatGroupDetail
                theme={this.theme}
                item={this.state.item} 
                type={this.state.type}
                actionGenerated={this.actionHandler} />
            </div>
          );
        }else{
          detailScreen = (
            <div css={unifiedSecondaryStyle(this.theme)}>
              <CometChatGroupDetail
                theme={this.theme}
                item={this.state.item} 
                type={this.state.type}
                actionGenerated={this.actionHandler} />
            </div>
          );
        }

        
      }
    }
    // console.log(this.state.composedthreadmessage);
    let detailMessageScreen = null;
    if(this.state.viewMessagedetailscreen) {
      
      if(this.state.type === "user") {

        detailMessageScreen = (
          <div css={unifiedSecondaryStyle(this.theme)}>
            <CometChatUserMessageDetail
              theme={this.theme}
              item={this.state.item} 
              type={this.state.type}
              actionGenerated={this.actionHandler} />
          </div>
          );

      } else if (this.state.type === "group") {
        detailMessageScreen = (
          <div css={unifiedSecondaryStyle(this.theme)}>
            <CometChatGroupMessageDetail
              theme={this.theme}
              item={this.state.item} 
              tab={this.state.tab}
              type={this.state.type}
              composedthreadmessage={this.state.composedthreadmessage}
              callmessage={this.state.callmessage}
              loggedInUser={this.loggedInUser}
              actionGenerated={this.actionHandler} />
          </div>
        );
      }
    }
    // console.log(this.state.callmessage);
    return (
      <div css={unifiedStyle(this.theme)}>
        {navScreen}
        {messageScreen}
        {detailScreen}
        {detailMessageScreen}
        {threadMessageView}
        <CallAlert 
        item={this.state.item} 
        theme={this.theme} 
        actionGenerated={this.actionHandler}  />
        
        <CallScreen
        theme={this.theme}
        item={this.state.item} 
        type={this.state.type}
        incomingCall={this.state.incomingCall}
        outgoingCall={this.state.outgoingCall}
        actionGenerated={this.actionHandler} />

      </div>
    );
  }
}

export default CometChatUnified;