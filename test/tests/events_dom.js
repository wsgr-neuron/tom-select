describe('DOM Events', function() {
	describe('"change"', function() {
		it_n('should be triggered once by addItem()', function(done) {
			var test = setup_test('<select>', {
				valueField: 'value',
				labelField: 'value',
				options: [
					{value: 'a'},
					{value: 'b'},
				],
				items: ['a']
			});

			var counter = 0;
			test.instance.on('change', function() { counter++; });
			test.instance.addItem('b');

			window.setTimeout(function() {
				expect(counter).to.be.equal(1);
				done();
			}, 0);
		});
		it_n('should be triggered once by removeItem()', function(done) {
			var test = setup_test('<select multiple>', {
				valueField: 'value',
				labelField: 'value',
				options: [
					{value: 'a'},
					{value: 'b'},
				],
				items: ['a','b']
			});

			var counter = 0;
			test.instance.on('change', function() { counter++; });
			test.instance.removeItem('b');

			window.setTimeout(function() {
				expect(counter).to.be.equal(1);
				done();
			}, 0);
		});
		it_n('should be triggered once by clear()', function(done) {
			var test = setup_test('<select multiple>', {
				valueField: 'value',
				labelField: 'value',
				options: [
					{value: 'a'},
					{value: 'b'},
				],
				items: ['a','b']
			});

			var counter = 0;
			test.instance.on('change', function() { counter++; });
			test.instance.clear();

			window.setTimeout(function() {
				expect(counter).to.be.equal(1);
				done();
			}, 0);
		});
	});

	describe('"input" and "change" on the input', function() {
		function record_events(test) {
			var events = [];
			test.select.addEventListener('input', function() { events.push('input'); });
			test.select.addEventListener('change', function() { events.push('change'); });
			return events;
		}

		it_n('should dispatch "change" once when the dropdown closes after selections', async function() {
			var test = setup_test('AB_Multi', {});
			var events = record_events(test);

			await test.instance.open();
			test.instance.addItem('a');
			test.instance.addItem('b');

			expect(events).to.deep.equal(['input', 'input']);

			test.instance.close();

			expect(events).to.deep.equal(['input', 'input', 'change']);
		});

		it_n('should not dispatch "change" when the dropdown closes with the selection it opened with', async function() {
			var test = setup_test('AB_Multi', {items: ['a']});
			var events = record_events(test);

			await test.instance.open();
			test.instance.removeItem('a');
			test.instance.addItem('a');
			test.instance.close();

			expect(events).to.deep.equal(['input', 'input']);
		});

		it_n('should not dispatch "change" when the dropdown closes without a change', async function() {
			var test = setup_test('AB_Multi', {items: ['a']});
			var events = record_events(test);

			await test.instance.open();
			test.instance.close();

			expect(events).to.deep.equal([]);
		});

		it_n('should dispatch "change" when the dropdown closes after clear()', async function() {
			var test = setup_test('AB_Multi', {items: ['a', 'b']});
			var events = record_events(test);

			await test.instance.open();
			test.instance.clear();

			expect(events).to.deep.equal(['input']);

			test.instance.close();

			expect(events).to.deep.equal(['input', 'change']);
		});

		it_n('should dispatch "change" once when a selection closes a single select', async function() {
			var test = setup_test('AB_Single', {});
			var events = record_events(test);

			await test.instance.open();
			test.instance.addItem('b');

			expect(test.instance.isOpen).to.be.equal(false);
			expect(events).to.deep.equal(['input', 'change']);
		});

		it_n('should dispatch "change" immediately for a change while the dropdown is closed', function() {
			var test = setup_test('AB_Multi', {items: ['a', 'b']});
			var events = record_events(test);

			test.instance.removeItem('b');

			expect(events).to.deep.equal(['input', 'change']);
		});
	});
});
