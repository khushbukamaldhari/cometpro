export const messageContainerStyle = () => {

    return {
        alignSelf: "flex-start",
        marginBottom: "16px",
        paddingLeft: "16px",
        paddingRight: "16px",
        maxWidth: "65%",
        clear: "both",
    }
}

export const messageWrapperStyle = () => {

    return {
        flex: "1 1",
        position: "relative",
        width: "100%",
    }
}

export const messageThumbnailStyle = () => {

    return {
        width: "36px",
        height: "36px",
        margin: "10px 5px",
        float: "left",
    }
}

export const messageDetailStyle = (name) => {

    const topPos = (name) ? { top: "-15px" } : { top: "-30px" };

    return {
        flex: "1 1",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ':hover': {
            'ul:first-of-type': {
                display: "inline-flex",
                ...topPos
            }
        }
    }
}

export const nameWrapperStyle = () => {

    return {
        alignSelf: "flex-start",
        padding: "3px 5px",
    }
}

export const nameStyle = (props) => {

    return {
        fontSize: "10px",
        color: `${props.theme.color.helpText}`,
    }
}

export const messageVideoWrapperStyle = (props) => {

    return {
        display: "inline-block",
        backgroundColor: `${props.theme.backgroundColor.secondary}`,
        borderRadius: "12px",
        padding: "8px 12px",
        alignSelf: "flex-start",
        '> video': {
            maxWidth: "250px",
            display: "inherit",
        }
    }
}

export const messageInfoWrapperStyle = () => {

    return {
        alignSelf: "flex-start",
        padding: "3px 5px",
    }
}

export const messageTimestampStyle = (props) => {

    return {
        display: "inline-block",
        fontSize: "11px",
        fontWeight: "500",
        lineHeight: "12px",
        textTransform: "uppercase",
        color: `${props.theme.color.helpText}`,
    }
}