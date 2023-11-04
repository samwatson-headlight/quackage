const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libFS = require('fs');

class QuackageCommandBuild extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'run-mocha-tests';
		this.options.Description = 'Run mocha tests in your tests/ folder.';

		this.options.CommandOptions.push({ Name: '-g, --grep [search_expression]', Description: 'A grep search expression for the subset of tests you want to run.' });

		this.options.Aliases.push('test');

		// Auto add the command on initialization
		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		// See if the user passed in a filter for tests
		let tmpTestGrepExpression = (typeof(this.CommandOptions.search_expression) === 'undefined') ? false : this.CommandOptions.search_expression;

		let tmpCWDMochaLocation = `${this.fable.AppData.CWD}/node_modules/.bin/mocha`;
		let tmpRelativePackageMochaLocation = `${__dirname}/../../../.bin/mocha`;
		let tmpGitRepositoryMochaLocation = `${__dirname}/../../node_modules/.bin/mocha`;

		let tmpMochaLocation = tmpCWDMochaLocation;

		// Check that mocha exists here
		if (!libFS.existsSync(tmpMochaLocation))
		{
			this.log.info(`CWD Location does not contain an installation of mocha at [${tmpCWDMochaLocation}]; checking relative to the quackage package...`);
			// Try the folder relative to quackage (wherever this packages' node modules are)
			tmpMochaLocation = tmpRelativePackageMochaLocation;
		}
		if (!libFS.existsSync(tmpMochaLocation))
		{
			this.log.info(`Relative Quackage Package Location does not contain an installation of mocha at [${tmpRelativePackageMochaLocation}]; checking if you're running from the direct git repository...`);
			// Try the folder relative to quackage (wherever this packages' node modules are)
			tmpMochaLocation = tmpGitRepositoryMochaLocation;
		}
		if (!libFS.existsSync(tmpMochaLocation))
		{
			let tmpErrorMessage = `Not even the git checkout location has an installation of mocha at [${tmpMochaLocation}]... building cannot commence.  We also tried CWD [${tmpCWDMochaLocation}] and relative node_modules [${tmpRelativePackageMochaLocation}].  Sorry!  Maybe you need to run "npm install" somewhere??`;
			this.log.info(tmpErrorMessage)
			return fActionCallback(new Error(tmpErrorMessage));
		}
		this.log.info(`Quackage found mocha at [${tmpMochaLocation}] ... executing build from there.`);

		if (tmpTestGrepExpression)
		{
			this.log.info(`Running mocha tests filtered to grep expression [${tmpTestGrepExpression}]`);
			// The standard mocha command we've been using for grep:
			// npx mocha -u tdd --exit -R spec --grep
			this.fable.QuackageProcess.execute(`${tmpMochaLocation}`, [`-u`, `tdd`, '--exit', '-R', 'spec', '--grep', tmpTestGrepExpression], { cwd: this.fable.AppData.CWD }, fCallback);
		}
		else
		{
			// The standard mocha command we've been using:
			// npx mocha -u tdd -R spec
			this.fable.QuackageProcess.execute(`${tmpMochaLocation}`, [`-u`, `tdd`, '-R', 'spec'], { cwd: this.fable.AppData.CWD }, fCallback);
		}
	};
}

module.exports = QuackageCommandBuild;