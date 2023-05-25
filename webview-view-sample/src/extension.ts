import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const provider = new ColorsViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('CatWisdom.addColor', () => {
			provider.addColor();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('CatWisdom.clearColors', () => {
			provider.clearColors();
		}));
}

class ColorsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'CatWisdom.colorsView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'colorSelected':
					{
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			}
		});
	}

	public addColor() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'addColor' });
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const catArray = [
			'cat2.png',
			'cat3.png',
			'cat4.png',
			'cat5.jpg',
			'cat6.png',
			'cat7.png',
			'cat8.png',
			'cat9.png',
			'cat10.png',
			'cat11.png',
			'graou.png',
		];
		const generateRandomCatPath = () => {
			const catIndex = Math.floor(Math.random() * catArray.length);
			return webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', catArray[catIndex]));
		};
		const catPath = generateRandomCatPath();
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		
		const citationArray = [
			'Coding like poetry should be short and concise. <br> <strong> Shawn Wildermuth </strong>',
			'It’s not a bug; it’s an undocumented feature. <br> <strong> Anonymous </strong>',
			'First, solve the problem. Then, write the code. <br> <strong> John Johnson </strong>',
			'Code is like humor. When you have to explain it, it’s bad. <br> <strong> Cory House </strong>',
			'Fix the cause, not the symptom. <br> <strong> Steve Maguire </strong>',
			'Optimism is an occupational hazard of programming: feedback is the treatment. <br> <strong> Kent Beck </strong>',
			'Make it work, make it right, make it fast. <br> <strong> Kent Beck </strong>',
			'Clean code always looks like it was written by someone who cares. <br> <strong> Michael Feathers </strong>',
			'Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live. <br> <strong> Rick Osborne </strong>',
			'Any fool can write code that a computer can understand. Good programmers write code that humans can understand. <br> <strong> Martin Fowler </strong>',
			'Programming is the art of telling another human being what one wants the computer to do. <br> <strong> Donald Knuth </strong>',
			'Software is like sex: it’s better when it’s free. <br> <strong> Linus Torvalds </strong>',
		];

		const generateRandomCitation = () => {
			const citationIndex = Math.floor(Math.random() * citationArray.length);
			return citationArray[citationIndex];
		};
		const citation = generateRandomCitation();
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} ${catPath};">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Cat Colors</title>
			</head>
			<body>
				<div id="cats">
					<img id="cat" src="${catPath}">
				</div>
				<div id="citation">
					${citation}
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}