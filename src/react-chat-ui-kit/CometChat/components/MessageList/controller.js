import { CometChat } from "@cometchat-pro/chat";

import * as enums from '../../util/enums.js';

export class MessageListManager {

    item = {};
    type = "";
    parentMessageId = null;
    messageRequest = null;
    msgListenerId = "message_" + new Date().getTime();
    groupListenerId = "group_" + new Date().getTime();
    callListenerId = "call_" + new Date().getTime(); 

    constructor(item, type, parentMessageId) {
console.log(item)
        this.item = item;
        this.type = type;
        this.parentMessageId = parentMessageId;

        if (type === "user") {
            if(this.parentMessageId) {
                this.messageRequest = new CometChat.MessagesRequestBuilder().setUID(item.uid).setParentMessageId(this.parentMessageId).setLimit(30).build();
                console.log(this.messageRequest);
            } else {
                this.messageRequest = new CometChat.MessagesRequestBuilder().setUID(item.uid).hideReplies(true).setLimit(30).build();
                console.log(this.messageRequest);
            }
        }
        else if (type === "group") {

            if(this.parentMessageId) {
                this.messageRequest = new CometChat.MessagesRequestBuilder().setGUID(item.guid).setParentMessageId(this.parentMessageId).setLimit(30).build();
            } else {
                this.messageRequest = new CometChat.MessagesRequestBuilder().setGUID(item.guid).hideReplies(true).setLimit(30).build();
            }
        } else if (type === "rooms") {

            if(this.parentMessageId) {
                this.messageRequest = new CometChat.MessagesRequestBuilder().setGUID(item.guid).setParentMessageId(this.parentMessageId).setLimit(30).build();
            } else {
                this.messageRequest = new CometChat.MessagesRequestBuilder().setGUID(item.guid).hideReplies(true).setLimit(30).build();
            }
        }
    }

    fetchPreviousMessages() {
        return this.messageRequest.fetchPrevious();
    }

    attachListeners(callback) {
        
        CometChat.addMessageListener(
            this.msgListenerId,
            new CometChat.MessageListener({
                onTextMessageReceived: textMessage => {
                    callback(enums.TEXT_MESSAGE_RECEIVED, textMessage);
                },
                onMediaMessageReceived: mediaMessage => {
                    callback(enums.MEDIA_MESSAGE_RECEIVED, mediaMessage);
                },
                onCustomMessageReceived: customMessage => {
                    callback(enums.CUSTOM_MESSAGE_RECEIVED, customMessage);
                },
                onMessagesDelivered: messageReceipt => {
                    callback(enums.MESSAGE_DELIVERED, messageReceipt);
                },
                onMessagesRead: messageReceipt => {
                    callback(enums.MESSAGE_READ, messageReceipt);
                },
                onMessageDeleted: deletedMessage => {
                    callback(enums.MESSAGE_DELETED, deletedMessage);
                },
                onMessageEdited: editedMessage => {
                    callback(enums.MESSAGE_EDITED, editedMessage);
                }
            })
        );

        CometChat.addGroupListener(
            this.groupListenerId,
            new CometChat.GroupListener({
                onGroupMemberScopeChanged: (message, changedUser, newScope, oldScope, changedGroup) => {
                    callback(enums.GROUP_MEMBER_SCOPE_CHANGED, message, changedGroup, {"user": changedUser, "scope": newScope});
                }, 
                onGroupMemberKicked: (message, kickedUser, kickedBy, kickedFrom) => {
                    callback(enums.GROUP_MEMBER_KICKED, message, kickedFrom, {"user": kickedUser, "hasJoined": false});
                }, 
                onGroupMemberBanned: (message, bannedUser, bannedBy, bannedFrom) => {
                    callback(enums.GROUP_MEMBER_BANNED, message, bannedFrom, {"user": bannedUser});
                }, 
                onGroupMemberUnbanned: (message, unbannedUser, unbannedBy, unbannedFrom) => {
                    callback(enums.GROUP_MEMBER_UNBANNED, message, unbannedFrom, {"user": unbannedUser});
                }, 
                onMemberAddedToGroup: (message, userAdded, userAddedBy, userAddedIn) => {
                    callback(enums.GROUP_MEMBER_ADDED, message, userAddedIn, {"user": userAdded, "hasJoined": true});
                }, 
                onGroupMemberLeft: (message, leavingUser, group) => {
                    callback(enums.GROUP_MEMBER_LEFT, message, group, {"user": leavingUser});
                }, 
                onGroupMemberJoined: (message, joinedUser, joinedGroup) => {
                    callback(enums.GROUP_MEMBER_JOINED, message, joinedGroup, {"user": joinedUser});
                }
            })
        );
        
        CometChat.addCallListener(
            this.callListenerId,
            new CometChat.CallListener({
                onIncomingCallReceived: call => {
                  callback(enums.INCOMING_CALL_RECEIVED, call);
                },
                onIncomingCallCancelled: call => {
                    callback(enums.INCOMING_CALL_CANCELLED, call);
                },
                onOutgoingCallAccepted: call => {
                    callback(enums.OUTGOING_CALL_ACCEPTED, call);
                },
                onOutgoingCallRejected: call => {
                  callback(enums.OUTGOING_CALL_REJECTED, call);
                }
            })
        );
    }

    removeListeners() {

        CometChat.removeMessageListener(this.msgListenerId);
        CometChat.removeGroupListener(this.groupListenerId);
        CometChat.removeCallListener(this.callListenerId);
    }
}