function uniqid() {
    uniqid._uid = Math.max(uniqid._uid + 1, Date.now());
    return uniqid._uid.toString(16);
}
uniqid._uid = 0;

export default uniqid;