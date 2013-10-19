/*global describe it */

var mahjong = require('../mahjong');
var assert = require("assert");
var util = require("util");
var _ = require('underscore');

_.extend(mahjong, mahjong.texting);

describe('utility functions', function(){
    describe('getColor', function(){
        it('should return the correct color', function(){
            assert.equal(mahjong.getColor(0), 'Pin');
            assert.equal(mahjong.getColor(8), 'Pin');
            assert.equal(mahjong.getColor(9), 'Sou');
            assert.equal(mahjong.getColor(17), 'Sou');
            assert.equal(mahjong.getColor(18), 'Honor');
            assert.equal(mahjong.getColor(26), 'Honor');
            assert.equal(mahjong.getColor(27), null);
            assert.equal(mahjong.getColor(-1), null);
        });
    });
    describe('toTileString', function(){
        it('should return the correct tile string', function(){
            var hands = [['123456789p 123s WW',
                          [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0]],
                         ['123s 123456789p WW',
                          [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0]],
                         ['111222333p NNN11',
                          [3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,0]],
                         ['1p 123456789s BGR9',
                          [1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,0,1]],
                         ['123456789s 1p BGR9',
                          [1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,0,1]],
                         ['NNSSWWEEEBGBGR',
                          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,1,0,0]]
                        ];
            _.each(hands, function(elem) {
                var hand_string = elem[0],
                    hand_list = elem[1];
                assert(mahjong.toTileString(hand_string).equals(hand_list));
            });
        });
        it('should return the correct hand string', function(){
            var hands = [['123456789p 123s WW',
                          [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0]],
                         ['111222333p NNN11',
                          [3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,0]],
                         ['1p 123456789s BGR9',
                          [1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,0,1]],
                         ['EEESSWWNNBBGGR',
                          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,1,0,0]]
                        ];
            _.each(hands, function(elem) {
                var hand_string_oracle = elem[0],
                    hand_list = elem[1],
                    hand_string = mahjong.toHandString(hand_list);
                assert(hand_string_oracle == hand_string,
                       util.format("Expected: %s, Actual: %s", hand_string_oracle, hand_string));
            });
        });
    });
});

describe('shanten functions', function(){
    describe('shantenCalculation', function(){
        it('should return correct shanten number', function(){
            var hands = [
                ['25s 34444589p WWE', 2],
                ['12333345s EEE SS', 0],
                ['1113335557779s', 0],
                ['258p 258s ESWN19RG', 8],
                ['EEESSSWWWGGRR', 0],
                ['1s EEESSSBBGGRR', 1],
                ['1289s 111555999p', 1],
                // ['12333s 89p EEESSS', 0],
                ['67p 2334446s ESWN', 3],
                // ['1124455567799s', 2],
                ['1122236677888s', 1],
                // ['1133445667788s', 0]
            ];
            hands = [
                ['12333s 89p EEESSS', 0]
            ];
            _.each(hands, function(elem) {
                console.log("NEXT!");
                var hand_string = elem[0],
                    shanten_num_oracle = elem[1],
                    shanten_num = mahjong.shantenGeneralized(mahjong.toTileString(hand_string));
                console.log(hand_string);
                console.log(mahjong.toTileString(hand_string));
                assert(shanten_num_oracle == shanten_num,
                       util.format("Hand: %s, Expected: %s, Actual: %s", hand_string, shanten_num_oracle, shanten_num));
            });
        });
    });
});