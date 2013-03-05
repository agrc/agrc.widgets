/*global describe, it, expect, agrc*/
describe('Formatting Module', function(){
	describe('Round', function(){
		it('should round 4 decimal places down to 2', function(){
			expect(agrc.modules.Formatting.Round(4.1234, 2)).toEqual(4.12);
		});
		
		it('should round 1 decimal places up to 2', function(){
			expect(agrc.modules.Formatting.Round(4.1, 2)).toEqual(4.10);
		});
	});
	describe("AddCommas", function(){
		it("should add commas", function(){
			expect(agrc.modules.Formatting.AddCommas(1000)).toEqual("1,000");
			expect(agrc.modules.Formatting.AddCommas(1000000)).toEqual("1,000,000");
			expect(agrc.modules.Formatting.AddCommas(1234.123)).toEqual("1,234.123");
			expect(agrc.modules.Formatting.AddCommas(-1000000)).toEqual("-1,000,000");
		});
	});
});
