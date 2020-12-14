export const presenceStyle = (props) => {
// console.log(props);
    let presenceStatus = {
        backgroundColor: "rgb(85, 85, 85)"
    }
    // console.log(props.status);
    if(props.status === "online" || props.status === "available") {
        presenceStatus = {
            backgroundColor: "rgb(0, 255, 0)"
        }
    }

    return {
        width: "9px",
        height: "9px",
        top: "-12px",
        float: "right",
        position: "relative",
        ...presenceStatus
    }
}