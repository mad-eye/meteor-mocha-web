//makes the bdd interface available (describe, it before, after, etc
if(Meteor.settings && Meteor.settings.public.mocha_setup_args) {
    mocha.setup(Meteor.settings.public.mocha_setup_args);
} else {
    mocha.setup("bdd");
}
