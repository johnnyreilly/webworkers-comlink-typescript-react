export function takeALongTimeToDoSomething() {
    console.log('Start our long running job...');
    const seconds = 5;
    const start = new Date().getTime();
    const delay = seconds * 1000;
    while (true) {
        if ((new Date().getTime() - start) > delay) {
            break;
        }
    }
    console.log('Finished our long running job');
}
