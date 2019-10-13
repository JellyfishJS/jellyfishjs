const Lint = require('tslint');

const leadingFailureString = 'Curly brackets must contain a leading space.';
const trailingFailureString = 'Curly brackets must contain a trailing space.';

module.exports.Rule = class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new SpaceInCurlyBracketsWalker(sourceFile, this.getOptions()));
    }
};

class SpaceInCurlyBracketsWalker extends Lint.RuleWalker {
    _handleCurlyBrackets(node) {
        const contents = node.getText();
        
        if (contents !== '{}' && (contents.slice(1, 2) !== ' ' && contents.slice(1, 2) !== '\n')) {
            const fix = new Lint.Replacement(node.getStart(), 1, '{ ');
            this.addFailure(this.createFailure(node.getStart(), 1, leadingFailureString, fix));
        }
        
        if (contents !== '{}' && (contents.slice(-2, -1) !== ' ' && contents.slice(-2, -1) !== '\n')) {
            const fix = new Lint.Replacement(node.getEnd() - 1, 1, ' }');
            this.addFailure(this.createFailure(node.getEnd() - 1, 1, trailingFailureString, fix));
        }
    }

    visitObjectLiteralExpression(node) {
        this._handleCurlyBrackets(node);
        super.visitObjectLiteralExpression(node);
    }

    visitBlock(node) {
        this._handleCurlyBrackets(node);
        super.visitBlock(node);
    }
}
