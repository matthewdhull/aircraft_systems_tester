import { emitKeypressEvents } from 'node:readline';

/** Read a secret without accepting it as a command argument or echoing it in a terminal. */
export async function readHidden(prompt: string): Promise<string> {
	if (!process.stdin.isTTY) {
		throw new Error('Secret input requires an interactive terminal; piped input is refused.');
	}
	process.stdout.write(prompt);
	emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);
	process.stdin.resume();
	return new Promise((resolve, reject) => {
		let value = '';
		const cleanup = () => {
			process.stdin.setRawMode(false);
			process.stdin.pause();
			process.stdin.off('keypress', onKeypress);
		};
		const onKeypress = (text: string, key: { name?: string; ctrl?: boolean }) => {
			if (key.ctrl && key.name === 'c') {
				cleanup();
				process.stdout.write('\n');
				reject(new Error('Operation cancelled.'));
				return;
			}
			if (key.name === 'return' || key.name === 'enter') {
				cleanup();
				process.stdout.write('\n');
				resolve(value);
				return;
			}
			if (key.name === 'backspace') value = value.slice(0, -1);
			else if (!key.ctrl && text) value += text;
		};
		process.stdin.on('keypress', onKeypress);
	});
}
