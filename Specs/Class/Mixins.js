/*
Script: Mixins.js
	Specs for Mixins.js

License:
	MIT-style license.
*/

var Local = Local || {};

describe("Chain Class", {

	"before all": function(){
		Local.Chain = new Class({

			Implements: Chain

		});
	},

	"callChain should not fail when nothing was added to the chain": function(){
		var chain = new Local.Chain();
		chain.callChain();
	},

	"should pass arguments to the function and return values": function(){
		var chain = new Local.Chain();
		var arr = [];
		chain.chain(function(a, b){
			var str = "0" + b + a;
			arr.push(str);
			return str;
		});
		chain.chain(function(a, b){
			var str = "1" + b + a;
			arr.push(str);
			return str;
		});
		var ret;
		value_of(arr).should_be([]);
		ret = chain.callChain("a", "A");
		value_of(ret).should_be("0Aa");
		value_of(arr).should_be(["0Aa"]);

		ret = chain.callChain("b", "B");
		value_of(ret).should_be("1Bb");
		value_of(arr).should_be(["0Aa", "1Bb"]);

		ret = chain.callChain();
		value_of(ret).should_be_null();
		value_of(arr).should_be(["0Aa", "1Bb"]);
	},

	"should chain any number of functions": function(){
		var chain = new Local.Chain();
		var arr = [];

		chain.chain(function(){
			arr.push(0);
		}, function(){
			arr.push(1);
		});

		value_of(arr).should_be([]);
		chain.callChain();
		value_of(arr).should_be([0]);
		chain.chain(function(){
			arr.push(2);
		});
		chain.callChain();
		value_of(arr).should_be([0, 1]);
		chain.callChain();
		value_of(arr).should_be([0, 1, 2]);
		chain.callChain();
		value_of(arr).should_be([0, 1, 2]);
	},

	"should allow an array of functions": function(){
		var chain = new Local.Chain();
		var arr = [];

		chain.chain([function(){
			arr.push(0);
		}, function(){
			arr.push(1);
		}, function(){
			arr.push(2);
		}]);

		value_of(arr).should_be([]);
		chain.callChain();
		value_of(arr).should_be([0]);
		chain.callChain();
		value_of(arr).should_be([0, 1]);
		chain.callChain();
		value_of(arr).should_be([0, 1, 2]);
		chain.callChain();
		value_of(arr).should_be([0, 1, 2]);
	},

	"each instance should have its own chain": function(){
		var foo = new Local.Chain();
		var bar = new Local.Chain();
		foo.val = "F";
		bar.val = "B";
		foo.chain(function(){
			this.val += 'OO';
		});
		bar.chain(function(){
			this.val += 'AR';
		});
		value_of(foo.val).should_be('F');
		value_of(bar.val).should_be('B');
		foo.callChain();
		bar.callChain();
		value_of(foo.val).should_be('FOO');
		value_of(bar.val).should_be('BAR');
	}

});


describe("Events Class", {

	"before all": function(){
		Local.EventsTest = new Class({
			Implements: Events,
			
			initialize: function(){
				this.called = 0;
			}
		});
	},

	"before each": function(){
		Local.called = 0;
		Local.fn = function(){
			return Local.called++;
		};
	},

	"should add an Event to the Class": function(){
		var myTest = new Local.EventsTest();
		myTest.addEvent('event', Local.fn);
		myTest.fireEvent('event');
		value_of(Local.called).should_be(1);
	},

	"should add multiple Events to the Class": function(){
		var myTest = new Local.EventsTest();
		myTest.addEvents({
			'event1': Local.fn,
			'event2': Local.fn
		});
		myTest.fireEvents('event1', 'event2');
		value_of(Local.called).should_be(2);
	},

	"should add a protected event": function(){
		var myTest = new Local.EventsTest();
		var protectedFn = (function(){ Local.fn(); }).protect();
		myTest.addEvent('protected', protectedFn);
		myTest.removeEvent('protected', protectedFn);
		myTest.fireEvent('protected');
		value_of(Local.called).should_be(1);
	},

	"should remove a specific method for an event": function(){
		var myTest = new Local.EventsTest();
		var x = 0, fn = function(){ x++; };
		myTest.addEvent('event', Local.fn);
		myTest.addEvent('event', fn);
		myTest.removeEvent('event', Local.fn);
		myTest.fireEvent('event');
		value_of(x).should_be(1);
		value_of(Local.called).should_be(0);
	},

	"should remove an event and its methods": function(){
		var myTest = new Local.EventsTest();
		var x = 0, fn = function(){ x++; };
		myTest.addEvent('event', Local.fn);
		myTest.addEvent('event', fn);
		myTest.removeEvents('event');
		myTest.fireEvent('event');
		value_of(x).should_be(0);
		value_of(Local.called).should_be(0);
	},

	"should remove all events": function(){
		var myTest = new Local.EventsTest();
		var x = 0, fn = function(){ x++; };
		myTest.addEvent('event1', Local.fn);
		myTest.addEvent('event2', fn);
		myTest.removeEvents();
		myTest.fireEvents(['event1', 'event2']);
		value_of(x).should_be(0);
		value_of(Local.called).should_be(0);
	},

	"should remove events with an object": function(){
		var myTest = new Local.EventsTest();
		var events = {
			event1: Local.fn,
			event2: Local.fn
		};
		myTest.addEvent('event1', function(){ Local.fn.call(this); }).addEvents(events);
		myTest.fireEvent('event1');
		value_of(Local.called).should_be(2);
		myTest.removeEvents(events);
		myTest.fireEvent('event1');
		value_of(Local.called).should_be(3);
		myTest.fireEvent('event2');
		value_of(Local.called).should_be(3);
	},
	
	"should be able to remove event during firing": function(){
		var myTest = new Local.EventsTest();
		myTest.addEvent('event', Local.fn);
		myTest.addEvent('event', function(){
			Local.fn();
			myTest.removeEvent('event', arguments.callee);
		});
		myTest.addEvent('event', function(){ Local.fn(); });
		myTest.fireEvent('event').fireEvent('event');
		value_of(Local.called).should_be(5);
	}

});

describe("Options Class", {

	"before all": function(){
		Local.OptionsTest = new Class({
			Implements: [Options, Events],
			
			options: {
				a: 1,
				b: 2
			},

			initialize: function(options){
				this.setOptions(options);
			}
		});
	},

	"should set options": function(){
		var myTest = new Local.OptionsTest({a: 1, b: 3});
		value_of(myTest.options).should_not_be(undefined);
	},

	"should override default options": function(){
		var myTest = new Local.OptionsTest({a: 3, b: 4});
		value_of(myTest.getOption('a')).should_be(3);
		value_of(myTest.getOption('b')).should_be(4);
	}

});

describe("Options Class w/ Events", {

	"before all": function(){
		Local.OptionsTest = new Class({
			Implements: [Options, Events],
			
			options: {
				onEvent1: function(){
					return true;
				},
				onEvent2: function(){
					return false;
				}
			},
	
			initialize: function(options){
				this.setOptions(options);
			}
		});
	},
	
	"should add events in the options object if class has implemented the Events class": function(){
		var myTest = new Local.OptionsTest({
			onEvent2: function(){
				return true;
			},
			
			onEvent3: function(){
				return true;
			}
		});

		value_of(myTest.$events.event1.length).should_be(1);
		value_of(myTest.$events.event2.length).should_be(1);
		value_of(myTest.$events.event3.length).should_be(1);
	}

});