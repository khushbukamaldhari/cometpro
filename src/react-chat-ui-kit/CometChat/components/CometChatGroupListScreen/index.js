import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { CometChat } from "@cometchat-pro/chat";

import { CometChatManager } from "../../util/controller";
import * as enums from '../../util/enums.js';

import CometChatGroupList from "../CometChatGroupList";
import CometChatMessageListScreen from "../CometChatMessageListScreen";
import CometChatGroupDetail from "../CometChatGroupDetail";
import MessageThread from "../MessageThread";
import CallAlert from "../CallAlert";
import CallScreen from "../CallScreen";

import { theme } from "../../resources/theme";

import {
  groupScreenStyle,
  groupScreenSidebarStyle,
  groupScreenMainStyle,
  groupScreenSecondaryStyle
} from "./style"
import axios from 'axios';
import { WP_API_CONSTANTS, WP_API_ENDPOINTS_CONSTANTS } from '../../../../consts';

class CometChatGroupListScreen extends React.Component {

  loggedInUser = null;

  constructor(props) {

		super(props);

    this.state = {
      darktheme: false,
      viewdetailscreen: false,
      item: {},
      type: "group",
      tab: "groups",
      callDataApi: null,
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
      callmessage: {},
      sidebarview: false
    }

    this.theme = Object.assign({}, theme, this.props.theme);
  }

  componentDidMount() {

    if(!Object.keys(this.state.item).length) {
      this.toggleSideBar();
    }

    new CometChatManager().getLoggedInUser().then((user) => {
      this.loggedInUser = user;
    }).catch((error) => {
      console.log("[CometChatUnified] getLoggedInUser error", error);
      
    });
  }

  changeTheme = (e) => {
    const theme = this.state.darktheme;
    this.setState({darktheme: !theme});
  }

  itemClicked = (item, type) => {
    
    this.toggleSideBar();

    this.setState({ item: {...item}, type, viewdetailscreen: false });
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
      case "joinVideoCall":
        this.joinVideoCall(item);
      break;
      // eslint-disable-next-line no-lone-blocks
      case "menuClicked": {
        this.toggleSideBar();
        this.setState({ item: {} });
      }
      break;
      case "closeMenuClicked":
        this.toggleSideBar();
      break;
      case "viewDetail":
      case "closeDetailClicked":
        this.toggleDetailView();
      break;
      case "groupUpdated":
        this.groupUpdated(item, count, ...otherProps);
        break;
      case "groupDeleted": 
        this.deleteGroup(item);
      break;
      case "leftGroup":
        this.leaveGroup(item, ...otherProps);
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
      case "outgoingCallCancelled":
      case "callEnded":
        this.outgoingCallEnded(item);
        break;
      case "userJoinedCall":
      case "userLeftCall":
        this.appendCallMessage(item);
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

    let receiverId, receiverType;
    if(this.state.type === "user") {

      receiverId = this.state.item.uid;
      receiverType = CometChat.RECEIVER_TYPE.USER;

    } else if(this.state.type === "group") {

      receiverId = this.state.item.guid;
      receiverType = CometChat.RECEIVER_TYPE.GROUP;
    }

    CometChatManager.call(receiverId, receiverType, CometChat.CALL_TYPE.AUDIO).then(call => {

      this.appendCallMessage(call);
      this.setState({ outgoingCall: call });

    }).catch(error => {
      console.log("Call initialization failed with exception:", error);
    });

  }

  videoCall = () => {
    console.log(this.state.type);
    let receiverId, receiverType;
    if(this.state.type === "user") {

      receiverId = this.state.item.uid;
      receiverType = CometChat.RECEIVER_TYPE.USER;

    } else if(this.state.type === "group") {
      receiverId = this.state.item.guid;
      console.log("sadrfsd");
      console.log(receiverId);
      receiverType = CometChat.RECEIVER_TYPE.GROUP;
    }
   
    CometChatManager.call(receiverId, receiverType, CometChat.CALL_TYPE.VIDEO).then(call => {
    
    this.appendCallMessage(call);
    this.setState({ outgoingCall: call });
    }).catch(error => {
      console.log("Call initialization failed with exception:", error);
    });

  }

  joinVideoCall = (call1) => {
    console.log(call1);
    
    // axios.get(`/wp-content/plugins/nb-chat-react/callingobject.json`)
    axios.get(`http://localhost/cometchatphpapi/callingobject.json?1=1`)
      .then(res => {
        const call = res.data;
        console.log( "API CALL: ", call );
        this.setState({ incomingCall: call });

        const type = this.state.incomingCall.receiverType;
        const id = (type === "user") ? this.state.incomingCall.sender.uid : this.state.incomingCall.receiverId;
        console.log(call);
        const globalStateContext = React.createContext(call);
        CometChat.getConversation(id, type).then(conversation => {
          console.log("join");
          console.log(conversation.conversationWith);
          console.log(type);
          this.itemClicked(conversation.conversationWith, type);
    
        }).catch(error => {
    
          console.log('error while fetching a conversation', error);
        });

    //     console.log(this.state.incomingCall.call.receiverType);
    //   const type = this.state.incomingCall.call.receiverType;
    //   const id = (type === "group") ? this.state.incomingCall.call.sender : this.state.incomingCall.call.id;
    // console.log("join");
    //   CometChat.getConversation(id, type).then(conversation => {
    //     console.log("accept");
    //     this.itemClicked(conversation.conversationWith, type);

    //   }).catch(error => {
    //     console.log('error while fetching a conversation', error);
    //   });
    })
    

  }

  toggleSideBar = () => {

    const sidebarview = this.state.sidebarview;
    this.setState({ sidebarview: !sidebarview });
  }

  toggleDetailView = () => {
    let viewdetail = !this.state.viewdetailscreen;
    this.setState({viewdetailscreen: viewdetail,  threadmessageview: false});
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

  closeThreadMessages = () => {
    this.setState({viewdetailscreen: false,  threadmessageview: false});
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

  acceptIncomingCall = (call) => {

    this.setState({ incomingCall: call });

    const type = call.receiverType;
    const id = (type === "user") ? call.sender.uid : call.receiverId;
    console.log(call);
    CometChat.getConversation(id, type).then(conversation => {
      console.log("accept");
      console.log(conversation.conversationWith);
      console.log(type);
      this.itemClicked(conversation.conversationWith, type);
      // axios.post(`http://localhost/cometchatphpapi/grouplist.php?dfg=sdgf`, {call})
      //   .then(res => {
      //     console.log( "POst call: ", call );
      // })
    }).catch(error => {
      console.log('error while fetching a conversation', error);
    });
   

  }

  callInitiated = (message) => {

    this.appendCallMessage(message );
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

  outgoingCallEnded = (message) => {

    this.setState({ outgoingCall: null, incomingCall: null });
    this.appendCallMessage(message);
  }

  appendCallMessage = (call) => {

    this.setState({ callmessage: call });
  }

  render() {

    let threadMessageView = null;
    if(this.state.threadmessageview) {
      threadMessageView = (
        <div css={groupScreenSecondaryStyle(this.theme)}>
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

    let detailScreen;
    if(this.state.viewdetailscreen) {

      detailScreen = (
        <div css={groupScreenSecondaryStyle(this.theme)}>
        <CometChatGroupDetail
          theme={this.theme}
          item={this.state.item} 
          type={this.state.type}
          actionGenerated={this.actionHandler} />
        </div>
      );
      
    }

    let messageScreen = null;
    if(Object.keys(this.state.item).length) {
      messageScreen = (
        <CometChatMessageListScreen
        theme={this.theme}
        item={this.state.item} 
        tab={this.state.tab}
        type={this.state.type}
        composedthreadmessage={this.state.composedthreadmessage}
        callmessage={this.state.callmessage}
        loggedInUser={this.loggedInUser}
        actionGenerated={this.actionHandler} />
      );
    }

    return (
      <div css={groupScreenStyle(this.theme)}>
        <div css={groupScreenSidebarStyle(this.state, this.theme)}>
          <CometChatGroupList
          theme={this.theme}
          item={this.state.item}
          type={this.state.type}
          groupToDelete={this.state.groupToDelete}
          groupToLeave={this.state.groupToLeave}
          groupToUpdate={this.state.groupToUpdate}
          onItemClick={this.itemClicked}
          actionGenerated={this.actionHandler}
          enableCloseMenu={Object.keys(this.state.item).length} />
        </div>
        <div css={groupScreenMainStyle(this.state)}>{messageScreen}</div>
        {detailScreen}
        {threadMessageView}
        <CallAlert
        theme={this.theme}
        actionGenerated={this.actionHandler} />
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

export default CometChatGroupListScreen;