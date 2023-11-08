export class Help {
  error(message) {
    this.write(`[ERROR] ${message}`);
  }

  log(...messages) {
    console.log(); // Spacer

    for (const message of messages) {
      console.log(message);
    }

    return this;
  }

  usage() {
    console.log(`
Usage:

  Build your contract JS file
  
      npx @smartweaver/slick-contract build <CONTRACT_FILE>

`);

    return this;
  }

  exit(code = 0) {
    console.log(); // Spacer
    process.exit(code);
  }
}