(function () {
    const vscode = acquireVsCodeApi();

    //we show the cat when the webview is loaded
    document.querySelector('#cat').style.display = 'block';
    document.querySelector('#cat').src = 'graou.png';


    document.querySelector('.add-color-button').addEventListener('click', () => {
        changeCat();
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'changeCat':
                {
                    changeCat();
                    break;
                }
            case 'clearColors':
                {
                    colors = [];
                    updateCat(colors);
                    break;
                }

        }
    });

    /**
     * @param {Array<{ value: string }>} colors
     */
    
    /** 
     * @param {string} color 
     */
    function onColorClicked(color) {
        vscode.postMessage({ type: 'colorSelected', value: color });
    }
    /**
     * @returns string
     */

    function changeCat() {
        //when this cat is clicked, it will change to another cat, it will pick a random cat from the array of cats
        const cats = [
            'cat1.png',
            'cat2.png',
        ];
        const cat = cats[Math.floor(Math.random() * cats.length)];
        //now that we have a random cat, we need to update the cat image
        //we can do this by selecting the cat image and setting the src attribute to the cat we just picked to the div with the class cat
        document.querySelector('#cat').src = cat;

        //the line below is for debugging purposes, it will log the cat url to the console
        console.log(cat);

        
    }
}());
