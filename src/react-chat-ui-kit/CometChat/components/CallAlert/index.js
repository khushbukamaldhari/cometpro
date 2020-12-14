import React from "react";

/** @jsx jsx */
import { jsx, keyframes } from "@emotion/core";
import { CometChat } from "@cometchat-pro/chat";

import { CometChatManager } from "../../util/controller";
import * as enums from '../../util/enums.js';

import Avatar from "../Avatar";
import { SvgAvatar } from '../../util/svgavatar';

import { CallAlertManager } from "./controller";

import {
    incomingCallWrapperStyle,
    callContainerStyle,
    headerWrapperStyle,
    callDetailStyle,
    nameStyle,
    callTypeStyle,
    thumbnailStyle,
    headerButtonStyle,
    ButtonStyle
} from "./style";

import audioCallIcon from "./resources/incomingaudiocall.png";
import videoCallIcon from "./resources/incomingvideocall.png";
import { incomingCallAlert } from "../../resources/audio/";

class CallAlert extends React.PureComponent {

    constructor(props) {

        super(props);

        this.state = {
            incomingCall: null,
            callInProgress: null
        }
    }

    componentDidMount() {
        this.incomingAlert = new Audio(incomingCallAlert);

        this.CallAlertManager = new CallAlertManager();
        this.CallAlertManager.attachListeners(this.callScreenUpdated);
    }

    playIncomingAlert = () => {

        this.incomingAlert.currentTime = 0;
        if (typeof this.incomingAlert.loop == 'boolean') {
            this.incomingAlert.loop = true;
        } else {
            this.incomingAlert.addEventListener('ended', function () {
                this.currentTime = 0;
                this.play();
            }, false);
        }
        this.incomingAlert.play();
    }

    callScreenUpdated = (key, call) => {
        
        switch (key) {

            case enums.INCOMING_CALL_RECEIVED://occurs at the callee end
                this.incomingCallReceived(call);
                break;
            case enums.INCOMING_CALL_CANCELLED://occurs(call dismissed) at the callee end, caller cancels the call
                this.incomingCallCancelled(call);
                break;
            default:
                break;
        }
    }

    incomingCallReceived = (incomingCall) => {

        const activeCall = CometChat.getActiveCall();
        //if there is another call in progress
        if (activeCall) {

            CometChat.rejectCall(incomingCall.sessionId, CometChat.CALL_STATUS.BUSY).then(rejectedCall => {

                //mark as read incoming call message
                this.markMessageAsRead(incomingCall);
                this.props.actionGenerated("rejectedIncomingCall", incomingCall, rejectedCall);

            }).catch(error => {
                
                this.props.actionGenerated("callError", error);
                console.log("Call rejection failed with error:", error);
            });

        } else if (this.state.incomingCall === null) {

            this.playIncomingAlert();

            if (incomingCall.sender.avatar === false) {

                const uid = incomingCall.sender.uid;
                const char = incomingCall.sender.name.charAt(0).toUpperCase();

                incomingCall.sender.avatar = SvgAvatar.getAvatar(uid, char);
            }

            this.setState({ incomingCall: incomingCall });
        }
    }

    incomingCallCancelled = (call) => {

        //we are not marking this as read as it will done in messagelist component
        this.incomingAlert.pause();
        this.setState({ incomingCall: null });
    }

    markMessageAsRead = (message) => {

        const receiverType = message.receiverType;
        const receiverId = (receiverType === "user") ? message.sender.uid : message.receiverId;

        if (message.hasOwnProperty("readAt") === false) {
            CometChat.markAsRead(message.id, receiverId, receiverType);
        }
    }

    rejectCall = () => {

        this.incomingAlert.pause();
        CometChatManager.rejectCall(this.state.incomingCall.sessionId, CometChat.CALL_STATUS.REJECTED).then(rejectedCall => {

            this.props.actionGenerated("rejectedIncomingCall", this.state.incomingCall, rejectedCall);
            this.setState({ incomingCall: null });

        }).catch(error => {

            this.props.actionGenerated("callError", error);
            this.setState({ incomingCall: null });
        });
    }

    acceptCall = () => {
        this.setState({ incomingCall: null, callInProgress: this.props.callInProgress });
        this.incomingAlert.pause();
        this.props.actionGenerated("acceptIncomingCall", this.state.incomingCall);
    }

    render() {
        let callScreen = null;
        if (this.state.incomingCall) {
            
            let callType = (
                <React.Fragment>
                    <img src={audioCallIcon} alt="Incoming audio call" /><span>Incoming audio call</span>
                </React.Fragment>
            );
            if (this.state.incomingCall.type === "video") {
                callType = (
                    <React.Fragment>
                        <img src={videoCallIcon} alt="Incoming video call" /><span>Incoming video call</span>
                    </React.Fragment>
                );
            }
            
            callScreen = (
                <div css={incomingCallWrapperStyle(this.props, keyframes)}>
                    <div css={callContainerStyle()}>
                        <div css={headerWrapperStyle()}>
                            <div css={callDetailStyle()}>
                                <div css={nameStyle()}>{this.state.incomingCall.sender.name}</div>
                                <div css={callTypeStyle(this.props)}>{callType}</div>
                            </div>
                            <div css={thumbnailStyle()}><Avatar cornerRadius="50%" image={this.state.incomingCall.sender.avatar} /></div>
                        </div>
                        <div css={headerButtonStyle()}>
                            <button css={ButtonStyle(this.props, 0)} onClick={this.rejectCall}>Decline</button>
                            <button css={ButtonStyle(this.props, 1)} onClick={this.acceptCall}>Accept</button>
                        </div>
                    </div>
                </div>
            );
        }
        return callScreen;
    }
}

export default CallAlert;
