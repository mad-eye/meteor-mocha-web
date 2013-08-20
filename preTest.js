//makes the bdd interface available (describe, it before, after, etc
if(Meteor.settings && Meteor.settings.public.mocha_setup_args) {
    window.mocha.setup(Meteor.settings.public.mocha_setup_args);
} else {
    window.mocha.setup("bdd");
}

//variables needed by other tests
mocha = window.mocha;
describe = window.describe;
it = window.it;
chai = window.chai
