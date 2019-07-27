
isRootComponent = (component) => {
    if( component.parentComponent === '0x0000000000000000000000000000000000000000') {
        return true;
    }
    return false;
}

export default isRootComponent;