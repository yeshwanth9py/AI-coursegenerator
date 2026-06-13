class ContentBlockStreamParser {
  constructor() {
    this.arrayStarted = false;
    this.braceDepth = 0;
    this.currentObject = "";
    this.inString = false;
    this.escaped = false;
  }

  push(chunk) {
    const objects = [];

    for (const character of chunk) {
      if (!this.arrayStarted) {
        if (character === "[") this.arrayStarted = true;
        continue;
      }

      if (this.braceDepth === 0 && character !== "{") continue;
      this.currentObject += character;

      if (this.escaped) {
        this.escaped = false;
        continue;
      }

      if (character === "\\" && this.inString) {
        this.escaped = true;
        continue;
      }

      if (character === '"') {
        this.inString = !this.inString;
        continue;
      }

      if (this.inString) continue;
      if (character === "{") this.braceDepth += 1;
      if (character === "}") this.braceDepth -= 1;

      if (this.braceDepth === 0) {
        const value = this.parseCurrentObject();
        if (value) objects.push(value);
      }
    }

    return objects;
  }

  parseCurrentObject() {
    try {
      return JSON.parse(this.currentObject);
    } catch {
      return null;
    } finally {
      this.currentObject = "";
    }
  }
}

module.exports = ContentBlockStreamParser;
