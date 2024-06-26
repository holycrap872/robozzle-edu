import { BoardBreakpoint, RobotDirection, RobotStates, StackBreakpoint, StackElement } from './lib/baseTypes';
import { DecodedCommand, decodeBits, decodeProgram, encodeBits, encodeProgram, encodeSOAP } from './lib/encoder';
import { Level, TUTORIAL_LEVELS, getDefaultLevel, isTutorialLevel } from './lib/levels';
import { Robot } from './lib/robot';

declare global {
    interface JQuery {
        pointerEventsNone(): JQuery;
        getClass(className: string): string;
        updateClass(className: string, newVvalue: string): void;
    }
}

var _____WB$wombat$assign$function_____ = function (name) { return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function (obj) { this.__WB_source = obj; return this; } }
{
    let window = _____WB$wombat$assign$function_____("window");
    let document = _____WB$wombat$assign$function_____("document");

    class Robozzle {
        urlCallback: any;
        urlTimeout: any;

        // level list info
        levelLoading: any;          // Handle of ajax request
        levelReload: boolean;       // A new request is needed

        sortKind: number;           // Currently selected level tab - Tutorial
        hideSolved: boolean;        // Currently hide solved option

        blockSortKind: number;      // Sort kind for last request
        blockHideSolved: boolean;   // Hide solved option for last request
        blockUserName: string;      // Username for last request

        blockIndex: number;         // Index of first entry of levels
        blockSize: number;          // Number of levels to download at a time
        pageIndex: number;          // Index of first displayed level
        pageSize: number;           // Number of levels to display at a time

        levels: any;                // Downloaded levels
        levelCount: number;         // Server reported number of levels

        // user info
        userName: string | null;
        password: string | null;
        solvedLevels: any;
        likeVotes: any;
        difficultyVotes: any;

        // active level info
        level: Level | null;
        selection: boolean;
        selectionCommand: string | null;
        selectionCondition: any
        selectionOffset: any;
        hoverCommand: string | null;
        hoverCondition: string | null;
        robot: Robot;

        // tutorial info
        tutorialStage: number;

        // design info
        design: Level | null;
        designSelection: boolean;
        designSelectionColor: any;
        designSelectionItem: any;
        designSelectionRobot: any;
        designSelectionOffset: any;
        designHoverColor: any;
        designHoverRobot: any;

        program: JQuery<HTMLElement>[][] | null;
        designProgram: DecodedCommand[][] | null;

        stack: StackElement[] | null;
        stackBreakpoint: StackBreakpoint | null;
        board: JQuery<HTMLElement>[][] | null;
        boardBreakpoint: BoardBreakpoint | null;

        constructor() {
            this.level = null;
            this.urlCallback = null;
            this.urlTimeout = null;

            // level list info
            this.levelLoading = null;         // Handle of ajax request
            this.levelReload = false;         // A new request is needed

            this.sortKind = -1;               // Currently selected level tab - Tutorial
            this.hideSolved = false;          // Currently hide solved option

            this.blockSortKind = -1;          // Sort kind for last request
            this.blockHideSolved = false;     // Hide solved option for last request
            this.blockUserName = null;       // Username for last request

            this.blockIndex = 0;              // Index of first entry of levels
            this.blockSize = 64;              // Number of levels to download at a time
            this.pageIndex = 0;               // Index of first displayed level
            this.pageSize = 8;                // Number of levels to display at a time

            this.levels = null;               // Downloaded levels
            this.levelCount = 0;              // Server reported number of levels

            // user info
            this.userName = null;
            this.password = null;
            this.solvedLevels = {};
            this.likeVotes = {};
            this.difficultyVotes = {};

            // active level info
            this.level = null;
            this.selection = false;
            this.selectionCommand = null;
            this.selectionCondition = null;
            this.selectionOffset = null;
            this.hoverCommand = null;
            this.hoverCondition = null;
            this.robot = new Robot();

            // tutorial info
            this.tutorialStage = 0;

            // design info
            this.design = null;
            this.designSelection = false;
            this.designSelectionColor = null;
            this.designSelectionItem = null;
            this.designSelectionRobot = null;
            this.designSelectionOffset = null;
            this.designHoverColor = null;
            this.designHoverRobot = null;

            this.program = null;
            this.designProgram = null;

            this.stack = null;
            this.stackBreakpoint = null;
            this.board = null;
            this.boardBreakpoint = null;
        }


        parseXML(node) {
            if (node.nodeType == Node.TEXT_NODE) {
                return node.nodeValue.replace(/^\s+/, '').replace(/\s+$/, '');
            } else if (node.nodeType == Node.ELEMENT_NODE) {
                if (node.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'nil') === 'true') {
                    return null;
                }
                var obj = {};
                for (var childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
                    //console.log([childNode.nodeName, childNode.nodeType, childNode.namespaceURI]);
                    var childVal = robozzle.parseXML(childNode);
                    if (childNode.nodeType == Node.TEXT_NODE) {
                        return childVal;
                    }
                    var childName = childNode.localName;
                    if (childNode.namespaceURI === 'http://schemas.microsoft.com/2003/10/Serialization/Arrays') {
                        if (!$.isArray(obj)) {
                            obj = [];
                        }
                        obj.push(childVal);
                    } else if (obj[childName]) {
                        if (!$.isArray(obj[childName])) {
                            obj[childName] = [obj[childName]];
                        }
                        obj[childName].push(childVal);
                    } else {
                        obj[childName] = childVal;
                    }
                }
                return obj;
            } else if (node.nodeType == Node.DOCUMENT_NODE) {
                return robozzle.parseXML(node.documentElement);
            } else {
                return null;
            }
        };


        service(method, data, success, error) {
            var url = '/RobozzleService.svc';
            if (document.domain === 'robozzle.com') {
                url = 'http://www.robozzle.com/RobozzleService.svc';
            }
            return $.soap({
                url: url,
                appendMethodToURL: false,
                namespaceURL: 'http://tempuri.org/',
                SOAPAction: 'http://tempuri.org/IRobozzleService/' + method,
                method: method,
                data: function (SOAPObject) { return encodeSOAP(SOAPObject, method, data); },
                success: function (soapResponse) {
                    var response = robozzle.parseXML(soapResponse.toXML()).Body[method + 'Response'];
                    success(response[method + 'Result'], response);
                },
                error: function (soapResponse) {
                    if (error) error();
                }
            });
        };

        topSolversResponse(table, solved, names) {
            var item;
            for (let i = 0; i < solved.length; i++) {
                item = $('#templates .score-item').clone();
                item.find('.score-item__value').text(solved[i]);
                item.find('.score-item__name').append(
                    $('<a target="_blank"/>')
                        .text(names[i])
                        .attr('href', '/user.aspx?name=' + encodeURIComponent(names[i])));
                table.append(item);
            }
        };

        topSolvers() {
            robozzle.service('GetTopSolvers2', {}, function (result, response) {
                robozzle.topSolversResponse($('#topsolvers'),
                    response.solved,
                    response.names);
                robozzle.topSolversResponse($('#topsolverstoday'),
                    response.solvedToday,
                    response.namesToday);
                $('#scoreboard').show();
            });
        };

        displayDifficulty(level, html, selector) {
            var difficultyAvg = 0;
            if (level.DifficultyVoteCount !== 0)
                difficultyAvg = Math.round(level.DifficultyVoteSum / level.DifficultyVoteCount * 10);
            var $difficultyVal = html.find(selector);
            for (var i = 0; i < 5; i++) {
                var val = difficultyAvg - i * 10;
                if (val > 10) {
                    val = 10;
                }
                if (val < 0) {
                    val = 0;
                }
                $difficultyVal.eq(i).updateClass('-difficulty-val', val);
            }
        };

        displayLevelItem(level) {
            var html = $('#templates .level-item').clone();
            html.attr('data-level-id', level.Id);
            html.find('.level-item__level-title').text(level.Title);
            if (isTutorialLevel(level.Id)) {
                html.find('.level-item__level-difficulty').hide();
                html.find('.level-item__level-details').hide();
                html.find('.level-item__level-votes').hide();
            } else {
                robozzle.displayDifficulty(level, html, '.level-item__level-difficulty-val');
                html.find('.level-item__level-stats')
                    .attr('href', '/puzzle.aspx?id=' + level.Id)
                    .attr('target', '_blank');
                html.find('.level-item__level-comments')
                    .text(level.CommentCount + ' comments')
                    .attr('href', '/forums/thread.aspx?puzzle=' + level.Id)
                    .attr('target', '_blank');
                if (level.SubmittedBy != null) {
                    html.find('.level-item__level-author-name')
                        .text(level.SubmittedBy)
                        .attr('href', '/user.aspx?name=' + encodeURIComponent(level.SubmittedBy))
                        .attr('target', '_blank');
                } else {
                    html.find('.level-item__level-author').hide();
                }
                html.find('.level-item__level-votes-liked').text('+' + level.Liked);
                html.find('.level-item__level-votes-disliked').text('-' + level.Disliked);
            }
            if (robozzle.solvedLevels[level.Id]) {
                html.addClass('-solved');
            }
            html.click(function () {
                robozzle.navigatePuzzle(String($(this).attr('data-level-id')));
            });
            html.find('.level-item__level-details').click(function (e) {
                e.stopPropagation();
            });
            return html;
        };

        displayLevels() {
            if (!robozzle.levels || robozzle.levelLoading) {
                return;
            }
            var levelpage = $('#level-page');
            levelpage.empty();
            for (var i = 0; i < robozzle.pageSize; i++) {
                var index = robozzle.pageIndex + i;
                if (index < robozzle.levelCount) {
                    var level = robozzle.levels[index - robozzle.blockIndex];
                    levelpage.append(robozzle.displayLevelItem(level));
                }
            }
            $('#pagecurrent').val(robozzle.pageIndex / robozzle.pageSize + 1);
            $('#pagemax').text(Math.floor((robozzle.levelCount + robozzle.pageSize - 1) / robozzle.pageSize));
        };

        clampPageIndex() {
            if (robozzle.pageIndex < 0) {
                robozzle.pageIndex = 0;
            }
            if (robozzle.pageIndex >= robozzle.levelCount) {
                robozzle.pageIndex = robozzle.levelCount - 1;
            }
            robozzle.pageIndex = robozzle.pageIndex - (robozzle.pageIndex % robozzle.pageSize);
        };

        getLevelsPaged(success, error) {
            // Record info so we know when we need to reload
            robozzle.blockIndex = robozzle.pageIndex - (robozzle.pageIndex % robozzle.blockSize);
            robozzle.blockSortKind = robozzle.sortKind;
            robozzle.blockHideSolved = robozzle.hideSolved;
            robozzle.blockUserName = robozzle.userName;

            if (robozzle.sortKind < 0) {
                var response = {
                    totalCount: TUTORIAL_LEVELS.length,
                    GetLevelsPagedResult: {
                        LevelInfo2: TUTORIAL_LEVELS
                    }
                }
                success(null, response);
                return;
            }

            // Build the request
            var request = {
                blockIndex: robozzle.blockIndex / robozzle.blockSize,
                blockSize: robozzle.blockSize,
                sortKind: robozzle.sortKind,
                unsolvedByUser: null
            };
            if (robozzle.userName && robozzle.hideSolved) {
                request.unsolvedByUser = robozzle.userName;
            }

            // Send the request
            return robozzle.service('GetLevelsPaged', request, success, error);
        }

        getLevels(is_force: boolean): void {
            robozzle.setPageTab('levels');

            // Prevent multiple requests
            if (robozzle.levelLoading) {
                robozzle.levelReload = true;
                if (is_force) {
                    robozzle.levelLoading.abort();
                }
                return;
            }
            robozzle.levelReload = false;

            // Check if we need to fetch levels
            robozzle.clampPageIndex();
            if (!is_force && robozzle.levels
                && robozzle.sortKind === robozzle.blockSortKind
                && robozzle.hideSolved === robozzle.blockHideSolved
                && robozzle.userName === robozzle.blockUserName
                && robozzle.pageIndex >= robozzle.blockIndex
                && robozzle.pageIndex < robozzle.blockIndex + robozzle.blockSize) {
                robozzle.displayLevels();
                return;
            }

            // Hide levels and show spinner
            $('#level-page').empty();
            var spinner = new Spinner({ zIndex: 99 }).spin($('#level-list-spinner')[0]);

            robozzle.levelLoading = robozzle.getLevelsPaged(function (result, response) {
                // Store the response
                robozzle.levelLoading = null;
                robozzle.levelCount = parseInt(response.totalCount, 10);
                robozzle.levels = response.GetLevelsPagedResult.LevelInfo2;
                if (!$.isArray(robozzle.levels)) {
                    // Handle only one level in the block
                    robozzle.levels = [robozzle.levels];
                }

                // Hide the spinner
                spinner.stop();

                // Update the display
                if (robozzle.levelReload) {
                    robozzle.getLevels(false);
                } else if (robozzle.pageIndex >= robozzle.levelCount) {
                    robozzle.getLevels(false);
                } else {
                    robozzle.displayLevels();
                }
            }, function () {
                robozzle.levelLoading = null;
                robozzle.levelCount = 0;
                robozzle.levels = null;

                // Hide the spinner
                spinner.stop();

                if (robozzle.levelReload) {
                    robozzle.getLevels(false);
                }
            });
        };

        setPageIndex(index) {
            index = parseInt(index);
            if (isNaN(index)) {
                index = 0;
            }
            robozzle.pageIndex = index;
            localStorage.setItem('pageIndex', index);
        };

        setSortKind(sortKind) {
            sortKind = parseInt(sortKind);
            if (isNaN(sortKind)) {
                sortKind = -1;
            }
            $('.level-sort__item').removeClass('-active');
            $('.level-sort__item[data-kind="' + sortKind + '"]').addClass('-active');
            robozzle.sortKind = sortKind;
            localStorage.setItem('sortKind', sortKind);
        };

        setRobotState(state) {
            robozzle.robot.robotState = state;
            if (robozzle.robot.robotState == RobotStates.Reset
                || robozzle.robot.robotState == RobotStates.Stopped
                || robozzle.robot.robotState == RobotStates.Stepping) {
                $('#program-go').text('Go!');
            } else {
                $('#program-go').text('Reset');
            }
            $('#program-step').prop('disabled', robozzle.robot.robotState == RobotStates.Finished);
        };


        displayRobot() {
            var state = robozzle.robot.robotAnimation;
            $('#robot')
                .css('left', state.left + 'px')
                .css('top', state.top + 'px')
                .css('transform', 'rotate(' + (((state.deg % 360) + 360) % 360) + 'deg) scale(' + state.scale + ')');
            $('#program-stack>').slice(0, state.stackCount)
                .css('transform', 'scaleX(' + state.stack + ')')
                .css('margin-right', Math.round((state.stack - 1.0) * 30) + 'px');
        };

        animateRobot(props) {
            $(robozzle.robot.robotAnimation).animate(props, {
                duration: robozzle.robot.robotDelay,
                easing: "linear",
                progress: robozzle.displayRobot
            });
        };

        displayBoard(level: Level, do_design: boolean): void {
            var stars = 0;
            var board: JQuery<HTMLElement>[][] = [];
            var $board = $('<table class="board__grid"/>');
            for (var j = 0; j < level.Colors.length; j++) {
                var colors = level.Colors[j];
                var items = level.Items[j];
                var row: JQuery<HTMLElement>[] = [];
                var $row = $('<tr/>');
                for (var i = 0; i < colors.length; i++) {
                    var $item = $('<div class="tile__item"/>');
                    var $cell = $('<td class="board__tile tile"/>')
                        .attr('data-col', i)
                        .attr('data-row', j)
                        .append($item);
                    if (items.charAt(i) !== '#') {
                        $cell.updateClass('-color', colors.charAt(i));
                        if (items.charAt(i) === '*') {
                            $item.updateClass('-item', 'star');
                            stars++;
                        }
                        if (!do_design) {
                            (function (row, col) {
                                $cell.on('click', function (e) {
                                    robozzle.setBoardBreakpoint(row, col);
                                });
                            })(j, i);
                        }
                    }
                    $cell.on('mousedown', function (e) {
                        if (robozzle.designSelection) {
                            robozzle.clickDesignSelection($(this));
                            robozzle.hoverDesignSelection($(this));
                            robozzle.moveDesignSelection($(this));
                            e.stopPropagation();
                        }
                    });
                    $cell.on('mousemove', function (e) {
                        if (robozzle.designSelection) {
                            if (e.buttons & 1) {
                                robozzle.clickDesignSelection($(this));
                            }
                        }
                        robozzle.hoverDesignSelection($(this));
                        robozzle.moveDesignSelection($(this));
                        e.stopPropagation();
                    });
                    $cell.on('mousedown', function (e) {
                        // Prevent dragging the image
                        e.preventDefault();
                        // Clear focus (the default handling would have done this)
                        document.activeElement.blur();
                    });
                    row.push($cell);
                    $row.append($cell);
                }
                board.push(row);
                $board.append($row);
            }
            var $robot = $('<div id="robot" class="board__robot tile"/>').pointerEventsNone()
                .append($('<div class="tile__robot"/>'));
            $('#board').empty().append($board).append($robot);
            robozzle.board = board;
            robozzle.starsMax = stars;
            robozzle.stars = stars;
            robozzle.steps = 0;
            robozzle.stack = [{ sub: 0, cmd: 0 }];
            robozzle.stackBreakpoint = null;
            robozzle.robot.robotDir = level.RobotDir;
            robozzle.robot.robotDeg = level.RobotDir * 90;
            robozzle.robot.robotCol = level.RobotCol;
            robozzle.robot.robotRow = level.RobotRow;
            robozzle.robot.robotAnimation = {
                left: robozzle.robot.robotCol * 40,
                top: robozzle.robot.robotRow * 40,
                deg: robozzle.robot.robotDeg,
                scale: 1.0,
                stack: 1.0,
                stackCount: 1
            };
            robozzle.boardBreakpoint = null;
            robozzle.displayRobot();
            robozzle.setRobotState(RobotStates.Reset);
        };

        displayStack() {
            var stack = $('#program-stack');
            stack.empty();
            var count = 0;
            for (var i = 0; i < robozzle.stack.length; i++) {
                var sub = robozzle.program[robozzle.stack[i].sub];
                for (var j = robozzle.stack[i].cmd; j < sub.length && count < 41; j++) {
                    var cmd = sub[j].find('.command').getClass('-command');
                    if (cmd) {
                        var stackCmd = sub[j].clone().removeClass('-program-highlight');
                        if (count != 0) {
                            (function (index) {
                                stackCmd.on('click', function (e) {
                                    robozzle.setStackBreakpoint(index);
                                });
                            })(count);
                        }
                        stack.append(stackCmd);
                        count++;
                    }
                }
            }

            robozzle.robot.robotAnimation.stack = 1.0;
            robozzle.robot.robotAnimation.stackCount = 1;
        };

        allowedCommand(command: string): number {
            if (!robozzle.level) {
                return 0;
            }

            if (command == 'f' || command == 'l' || command == 'r') {
                return 1;
            }

            if (command == '1') {
                return robozzle.level.SubLengths[0];
            }
            if (command == '2') {
                return robozzle.level.SubLengths[1];
            }
            if (command == '3') {
                return robozzle.level.SubLengths[2];
            }
            if (command == '4') {
                return robozzle.level.SubLengths[3];
            }
            if (command == '5') {
                return robozzle.level.SubLengths[4];
            }

            let allowedCommands = robozzle.level.AllowedCommands;
            if (command == 'R') {
                return allowedCommands & 1;
            }
            if (command == 'G') {
                return allowedCommands & 2;
            }
            if (command == 'B') {
                return allowedCommands & 4;
            }

            return 0;
        };

        hoverSelection(condition: string | null, command: string | null): void {
            if (condition !== null && typeof condition !== "string") {
                console.log(condition)
                throw new TypeError("Expected `condition` to be of type string | null");
            }
            if (condition !== null && typeof command !== "string") {
                console.log(command)
                throw new TypeError("Expected `command` to be of type string | null");
            }

            robozzle.hoverCondition = condition;
            robozzle.hoverCommand = command;
        };

        moveSelection($src, x, y) {
            if ($src) {
                robozzle.selectionOffset = $src.offset();
                robozzle.selectionOffset.left--;
                robozzle.selectionOffset.top--;
                $('#program-selection').addClass('program-selection-highlight');
            } else if (x || y) {
                robozzle.selectionOffset = { left: x, top: y };
                $('#program-selection').removeClass('program-selection-highlight');
            } else if (!robozzle.selectionOffset) {
                robozzle.selectionOffset = $('#program-container').offset();
            }
            $('#program-selection').filter(':visible').offset(robozzle.selectionOffset);
            $('#program-selection').updateClass('-condition', robozzle.selectionCondition || robozzle.hoverCondition || 'any');
            $('#program-selection .command').updateClass('-command', robozzle.selectionCommand || robozzle.hoverCommand || null);
        };

        setSelection(condition: string | null, command: string | null): void {
            if (!$('#program-toolbar').is(':visible')) {
                return;
            }
            if ($('#dialog-modal').is(':visible')) {
                return;
            }
            if (!condition && !command) {
                return;
            }
            if (command && !robozzle.allowedCommand(command)) {
                return;
            }
            robozzle.stepReset();
            robozzle.selection = true;
            robozzle.selectionCondition = condition;
            robozzle.selectionCommand = command;
            $('#program-selection').css('visibility', 'visible');
            robozzle.moveSelection();
        };

        hideSelection(condition, command) {
            $('#program-selection').css('visibility', 'hidden');
            robozzle.selection = false;
        };


        displayProgram(level: Level, commands: DecodedCommand[][]): void {
            if (!commands) {
                commands = [];
            }
            var program: JQuery<HTMLElement>[][] = [];
            var $sublist = $('#program-list').empty();
            for (var j = 0; j < 5; j++) {
                var sub: JQuery<HTMLElement>[] = [];
                var sublength: number = level.SubLengths[j];
                if (!sublength) {
                    program.push(sub);
                    continue;
                }
                var $subgrid = $('<div id="program-list-sub-f' + (j + 1) + '" class="program-list__grid -sublen' + sublength + '"/>');
                for (var i = 0; i < sublength; i++) {
                    var $condition = $('<div class="program-list__condition condition"/>')
                        .on('mousemove', function (e) {
                            robozzle.hoverSelection($(this).getClass('-condition'),
                                $(this).find('.command').getClass('-command'));
                            robozzle.moveSelection($(this));
                            e.stopPropagation();
                        })
                        .click(function (e) {
                            var condition = $(this).getClass('-condition');
                            var command = $(this).find('.command').getClass('-command');
                            if (robozzle.selection) {
                                if (robozzle.selectionCondition) {
                                    $(this).updateClass('-condition', robozzle.selectionCondition);
                                } else if (!$(this).getClass('-condition')) {
                                    $(this).updateClass('-condition', 'any');
                                }
                                if (robozzle.selectionCommand) {
                                    $(this).find('.command').updateClass('-command', robozzle.selectionCommand);
                                }
                                $(this).find('span').hide();
                                robozzle.hideSelection();

                                // If the selection came from the program (not the toolbar),
                                // then change the selection to the command it replaced.
                                // This makes it easier to reorder existing commands.
                                if (robozzle.selectionCondition && robozzle.selectionCommand) {
                                    robozzle.setSelection(condition, command);
                                }
                            } else {
                                $(this).updateClass('-condition', null);
                                $(this).find('.command').updateClass('-command', null);
                                $(this).find('span').show();
                                robozzle.setSelection(condition, command);
                            }
                            robozzle.hoverSelection($(this).getClass('-condition'),
                                $(this).find('.command').getClass('-command'));
                            robozzle.updatePuzzleUrl();
                            e.stopPropagation();
                        });
                    var $command = $('<div class="program-list__command command"/>');
                    var $label = $('<span/>').text(i);
                    if (j < commands.length && i < commands[j].length) {
                        // TODO: validate commands
                        if (commands[j][i][0] != null) {
                            $condition.updateClass('-condition', commands[j][i].condition);
                            $command.updateClass('-command', commands[j][i].command);
                            $label.hide();
                        } else if (commands[j][i][1] != null) {
                            $condition.updateClass('-condition', 'any');
                            $command.updateClass('-command', commands[j][i].command);
                            $label.hide();
                        }
                    }
                    if (i == 5 && sublength != 5) {
                        $subgrid.append($('<br/>'));
                    }
                    sub.push($condition);
                    $subgrid.append($condition.append($command).append($label));
                }
                program.push(sub);
                var $sublabel = $('<div class="program-list__label"/>').text('F' + (j + 1));
                var $sub = $('<div class="program-list__item"/>').append($sublabel).append($subgrid);
                $sublist.append($sub);
            }
            robozzle.program = program;
        };

        readProgram(): DecodedCommand[][] {
            var program: DecodedCommand[][] = [];
            for (var j = 0; j < robozzle.program.length; j++) {
                var $sub = robozzle.program[j];
                var sub: DecodedCommand[] = [];
                for (var i = 0; i < $sub.length; i++) {
                    var $cmd = $sub[i];
                    var cond = $cmd.getClass('-condition');
                    var cmd = $cmd.find('.command').getClass('-command');
                    sub.push({ condition: cond, command: cmd });
                }
                program.push(sub);
            }

            return program;
        };

        encodeSolution() {
            var program = '';
            for (var j = 0; j < robozzle.program.length; j++) {
                var sub = robozzle.program[j];
                for (var i = 0; sub[i]; i++) {
                    var $cmd = sub[i];
                    var cond = $cmd.getClass('-condition');
                    switch (cond) {
                        case 'any': program += '_'; break;
                        case 'R': program += 'r'; break;
                        case 'G': program += 'g'; break;
                        case 'B': program += 'b'; break;
                        default: continue;
                    }
                    var cmd = $cmd.find('.command').getClass('-command');
                    switch (cmd) {
                        case 'f': program += 'F'; break;
                        case 'l': program += 'L'; break;
                        case 'r': program += 'R'; break;
                        case '1': program += '1'; break;
                        case '2': program += '2'; break;
                        case '3': program += '3'; break;
                        case '4': program += '4'; break;
                        case '5': program += '5'; break;
                        case 'R': program += 'r'; break;
                        case 'G': program += 'g'; break;
                        case 'B': program += 'b'; break;
                        default: program += '_'; break;
                    }
                }
                program += '|';
            }
            return program;
        };

        submitSolution() {
            if (!robozzle.level || !robozzle.level.Id)
                return;

            robozzle.solvedLevels[robozzle.level.Id] = true;

            if (!robozzle.userName || !robozzle.password)
                return;

            var request = {
                levelId: robozzle.level.Id,
                userName: robozzle.userName,
                password: robozzle.password,
                solution: robozzle.encodeSolution()
            };
            robozzle.service('SubmitSolution', request, function (result, response) {
                // console.log(response.SubmitSolutionResult);
            });
        };

        submitLevelVote() {
            if (!robozzle.level || !robozzle.userName || !robozzle.password)
                return;

            var prevLikeVote = robozzle.likeVotes[robozzle.level.Id] || 0;
            var likeVote;
            if ($('#dialog-solved-like').prop('checked')) {
                likeVote = 1;
            } else if ($('#dialog-solved-dislike').prop('checked')) {
                likeVote = -1;
            } else {
                likeVote = 0;
            }

            var prevDifficultyVote = robozzle.difficultyVotes[robozzle.level.Id] || 0;
            var difficultyVote = $('#dialog-solved-difficulty input:checked').first().val() || 0;

            if (prevLikeVote == likeVote && prevDifficultyVote == difficultyVote)
                return;

            robozzle.likeVotes[robozzle.level.Id] = likeVote;
            robozzle.difficultyVotes[robozzle.level.Id] = difficultyVote;

            var request = {
                userName: robozzle.userName,
                password: robozzle.password,
                levelId: robozzle.level.Id,
                vote0: likeVote,
                vote1: difficultyVote
            };
            robozzle.service('SubmitLevelVote', request, function (result, response) {
            });
        };

        displayProgramToolbar(level: Level) {
            var $toolbar = $('#program-toolbar').empty();
            var makeCommand = function (command, title) {
                var ret = $('<button id="program-toolbar-command-' + command + '" class="program-toolbar__icon"/>')
                    .prop('title', title)
                    .append($('<div class="program-toolbar__command command"/>').updateClass('-command', command))
                    .click(function (e) {
                        robozzle.setSelection(null, command);
                        e.stopPropagation();
                    });
                return ret;
            }
            var makeCondition = function (condition, title) {
                var ret = $('<button id="program-toolbar-command-' + condition + '" class="program-toolbar__icon"/>')
                    .prop('title', title)
                    .append($('<div class="program-toolbar__command command"/>').updateClass('-condition', condition))
                    .click(function (e) {
                        robozzle.setSelection(condition, null);
                        e.stopPropagation();
                    });
                return ret;
            }
            $toolbar.append(
                $('<div id="program-toolbar-move"/>').addClass('program-toolbar__icon-group')
                    .append(makeCommand('f', 'Move forward (w)'),
                        makeCommand('l', 'Turn left (q)'),
                        makeCommand('r', 'Turn right (e)')));

            if (!level.DisallowSubs) {
                var $group = $('<div/>').addClass('program-toolbar__icon-group');
                for (var i = 0; i < 5; i++) {
                    if (level.SubLengths[i]) {
                        $group.append(makeCommand(i + 1, 'Call F' + (i + 1) + ' (' + (i + 1) + ')'));
                    }
                }
                $toolbar.append($group);
            }

            let allowedCommands = level.AllowedCommands;
            if (allowedCommands) {
                var $group = $('<div/>').addClass('program-toolbar__icon-group');
                if (allowedCommands & 1) {
                    $group.append(makeCommand('R', 'Paint red (R)'));
                }
                if (allowedCommands & 2) {
                    $group.append(makeCommand('G', 'Paint green (G)'));
                }
                if (allowedCommands & 4) {
                    $group.append(makeCommand('B', 'Paint blue (B)'));
                }
                $toolbar.append($group);
            }

            if (!level.DisallowColors) {
                $toolbar.append(
                    $('<div/>').addClass('program-toolbar__icon-group')
                        .append(makeCondition('any', 'No condition (n)'),
                            makeCondition('R', 'Red condition (r)'),
                            makeCondition('G', 'Green condition (g)'),
                            makeCondition('B', 'Blue condition (b)')));
            }
        };

        tutorialBack() {
            robozzle.tutorialStage--;
            robozzle.displayTutorial(robozzle.level);
        };

        tutorialContinue() {
            robozzle.tutorialStage++;
            robozzle.displayTutorial(robozzle.level);
        };

        displayTutorial(level) {
            $('.-tutorial-highlight').removeClass('-tutorial-highlight');

            if (!level || !isTutorialLevel(level.Id)) {
                $('#tutorial-modal').hide();
                $('#tutorial').hide();
                return;
            }

            $('#tutorial').show();
            $('#tutorial-message').html(level.Tutorial[robozzle.tutorialStage]);
            if (robozzle.tutorialStage <= 0) {
                $('#tutorial-back').hide();
            } else {
                $('#tutorial-back').show();
            }
            if (robozzle.tutorialStage === level.Tutorial.length - 1) {
                $('#tutorial-continue').hide();
                $('#tutorial-solve').prop('disabled', true).show();
                $('#tutorial-modal').hide();
            } else {
                $('#tutorial-continue').show();
                $('#tutorial-solve').hide();
                $('#tutorial-modal').show();
            }
            if (level.Id == -1 && robozzle.tutorialStage == 1) {
                $('#program-toolbar-move').addClass('-tutorial-highlight');
            }
            if (level.Id == -1 && robozzle.tutorialStage == 2) {
                $('#program-list-sub-f1').addClass('-tutorial-highlight');
            }
            if (level.Id == -2 && robozzle.tutorialStage == 1) {
                $('#program-toolbar-command-2').addClass('-tutorial-highlight');
            }
            if (level.Id == -2 && robozzle.tutorialStage == 0) {
                $('#program-list-sub-f2').addClass('-tutorial-highlight');
            }
            if (level.Id == -4 && robozzle.tutorialStage == 1) {
                $('#program-toolbar-command-B').addClass('-tutorial-highlight');
            }
        };

        displayGame(level: Level, program: DecodedCommand[][]): void {
            if (!level) {
                robozzle.navigateIndex();
                return;
            }

            if (level.Id) {
                robozzle.setPageTab(null);
            }
            $('#content-game').show();
            $('#content-game').children().hide();
            $('#board-container').show();
            $('#board-status').show();
            $('#program-container').show();
            $('#program-toolbar-container').show();
            $('#program-stack-container').show();
            $('#program-selection').show();
            $('#program-edit').hide();

            robozzle.level = level;
            robozzle.tutorialStage = 0;

            if (isTutorialLevel(level.Id)) {
                $('#board-status').hide();
            } else if (robozzle.level.Id) {
                var status = $('#board-status');
                status.find('.board-status__title').text(level.Title);
                if (!jQuery.isEmptyObject(level.About) && level.About !== null) {
                    status.find('.board-status__about').text(level.About).show();
                } else {
                    status.find('.board-status__about').hide();
                }
                status.find('.board-status__stats')
                    .attr('href', '/puzzle.aspx?id=' + level.Id)
                    .attr('target', '_blank')
                    .show();
                status.find('.board-status__comments')
                    .text(level.CommentCount + ' comments')
                    .attr('href', '/forums/thread.aspx?puzzle=' + level.Id)
                    .attr('target', '_blank')
                    .show();
            } else {
                $('#program-edit').show();
            }

            robozzle.displayBoard(level, false);
            robozzle.displayProgram(level, program);
            robozzle.displayProgramToolbar(level);
            robozzle.displayTutorial(level);
        };

        setGame(id: string, program: DecodedCommand[][]): void {
            robozzle.design = null;
            var levels = robozzle.levels;
            if (isTutorialLevel(id)) {
                levels = TUTORIAL_LEVELS;
            }
            if (levels !== null) {
                var level;
                for (var i = 0; i < levels.length; i++) {
                    level = levels[i];
                    if (level.Id === id) {
                        robozzle.displayGame(level, program);
                        return;
                    }
                }
            }
            var request = {
                levelId: id
            };
            robozzle.service('GetLevel', request, function (result, response) {
                robozzle.displayGame(response.GetLevelResult, program);
            });
        };

        hoverDesignSelection($src) {
            if ($src) {
                robozzle.designHoverColor = $src.getClass('-color');
                if ($src.attr('data-col') == robozzle.robot.robotCol && $src.attr('data-row') == robozzle.robot.robotRow) {
                    robozzle.designHoverRobot = robozzle.robot.robotDir;
                } else {
                    robozzle.designHoverRobot = null;
                }
            } else {
                robozzle.designHoverColor = 'none'; // Hack to avoid error style
                robozzle.designHoverRobot = null;
            }
        };

        moveDesignSelection($src, x, y) {
            if ($src) {
                robozzle.designSelectionOffset = $src.offset();
                robozzle.designSelectionOffset.left -= 2;
                robozzle.designSelectionOffset.top -= 2;
                $('#design-selection').addClass('design-selection-highlight');
            } else if (x || y) {
                robozzle.designSelectionOffset = { left: x, top: y };
                $('#design-selection').removeClass('design-selection-highlight');
            } else if (!robozzle.designSelectionOffset) {
                robozzle.designSelectionOffset = $('#design-toolbar-container').offset();
            }
            $('#design-selection').filter(':visible').offset(robozzle.designSelectionOffset);

            var color = robozzle.designSelectionColor || robozzle.designHoverColor;
            var item = robozzle.designSelectionItem;
            var robot = robozzle.designSelectionRobot;
            if (robot === null) robot = robozzle.designHoverRobot;
            if (robot === null) robot = 'none';

            if (item === 'star' && (color === null || robot !== 'none')) {
                // Can't put star on empty tile or robot
                color = 'error';
            }

            if (item === 'erase' && robot !== 'none') {
                // Can't erase robot
                color = 'error';
            }

            if (robot !== 'none' && color === null) {
                // Can't put robot on empty tile
                color = 'error';
            }

            $('#design-selection').updateClass('-color', color);
            $('#design-selection .tile__robot').updateClass('-robot', robot);
            $('#design-selection .tile__item').updateClass('-item', item);
        };

        setDesignSelection(color, item, robot) {
            if (!$('#design-toolbar').is(':visible')) {
                return;
            }
            if ($('#dialog-modal').is(':visible')) {
                return;
            }
            if (color === null && item === null && robot === null) {
                return;
            }
            robozzle.designSelection = true;
            robozzle.designSelectionColor = color;
            robozzle.designSelectionItem = item;
            robozzle.designSelectionRobot = robot;
            $('#design-selection').css('visibility', 'visible');
            robozzle.moveDesignSelection();
        };

        hideDesignSelection(condition, command) {
            $('#design-selection').css('visibility', 'hidden');
            robozzle.designSelection = false;
        };

        clickDesignSelection($cell) {
            if (robozzle.designSelectionColor !== null) {
                $cell.updateClass('-color', robozzle.designSelectionColor);
                $cell.find('.tile__item').updateClass('-item', null);
            } else if (robozzle.designSelectionRobot !== null) {
                if ($cell.getClass('-color')) {
                    $cell.find('.tile__item').updateClass('-item', null);
                    robozzle.robot.robotCol = parseInt($cell.attr('data-col'));
                    robozzle.robot.robotRow = parseInt($cell.attr('data-row'));
                    robozzle.robot.robotDir = robozzle.designSelectionRobot;
                    robozzle.robot.robotDeg = robozzle.robot.robotDir * 90;
                    robozzle.robot.robotAnimation = {
                        left: robozzle.robot.robotCol * 40,
                        top: robozzle.robot.robotRow * 40,
                        deg: robozzle.robot.robotDeg,
                        scale: 1.0,
                        stack: 1.0,
                        stackCount: 1
                    };
                    robozzle.displayRobot();
                }
            } else if ($cell.attr('data-col') != robozzle.robot.robotCol || $cell.attr('data-row') != robozzle.robot.robotRow) {
                if (robozzle.designSelectionItem == 'star') {
                    if ($cell.getClass('-color')) {
                        $cell.find('.tile__item').updateClass('-item', 'star');
                    }
                } else if (robozzle.designSelectionItem == 'erase') {
                    $cell.updateClass('-color', null);
                    $cell.find('.tile__item').updateClass('-item', null);
                }
            }
            robozzle.updateDesignUrl();
        };

        displayDesignToolbar() {
            var $toolbar = $('#design-toolbar').empty();
            var makeColor = function (color, title) {
                return $('<div class="design-toolbar__tile tile"/>')
                    .prop('title', title)
                    .updateClass('-color', color)
                    .click(function (e) {
                        robozzle.setDesignSelection(color, null, null);
                        e.stopPropagation();
                    });
            }
            var makeItem = function (item, title) {
                return $('<div class="design-toolbar__tile tile"/>')
                    .prop('title', title)
                    .updateClass('-color', 'icon')
                    .append($('<div class="tile__item"/>').updateClass('-item', item))
                    .click(function (e) {
                        robozzle.setDesignSelection(null, item, null);
                        e.stopPropagation();
                    });
            }
            var makeRobot = function (robot, title) {
                return $('<div class="design-toolbar__tile tile"/>')
                    .prop('title', title)
                    .updateClass('-color', 'icon')
                    .append($('<div class="tile__robot"/>').updateClass('-robot', robot))
                    .click(function (e) {
                        robozzle.setDesignSelection(null, null, robot);
                        e.stopPropagation();
                    });
            }
            $toolbar.append(makeColor('R', 'Red tile (r)'));
            $toolbar.append(makeColor('G', 'Green tile (g)'));
            $toolbar.append(makeColor('B', 'Blue tile (b)'));
            $toolbar.append(makeItem('erase', 'Erase (x)'));
            $toolbar.append(makeItem('star', 'Star (s)'));
            $toolbar.append(makeRobot(0, 'Robot right'));
            $toolbar.append(makeRobot(1, 'Robot down'));
            $toolbar.append(makeRobot(2, 'Robot left'));
            $toolbar.append(makeRobot(3, 'Robot up'));
        };

        encodeDesign(level: Level): string {
            var encodeState = {
                output: '',
                val: 0,
                bits: 0
            };

            encodeBits(encodeState, 0, 3); // Version number = 0
            for (let j = 0; j < level.Colors.length; j++) {
                var colors = level.Colors[j];
                var items = level.Items[j];
                for (let i = 0; i < colors.length; i++) {
                    var val = 0;
                    if (items.charAt(i) != '#') {
                        if (colors.charAt(i) == 'R') {
                            val = 1;
                        } else if (colors.charAt(i) == 'G') {
                            val = 2;
                        } else if (colors.charAt(i) == 'B') {
                            val = 3;
                        }
                        if (items.charAt(i) == '*') {
                            val = val + 3;
                        }
                    }
                    encodeBits(encodeState, val, 3);
                }
            }
            encodeBits(encodeState, level.RobotRow, 4);
            encodeBits(encodeState, level.RobotCol, 4);
            encodeBits(encodeState, level.RobotDir, 2);
            for (let i = 0; i < level.SubLengths.length; i++) {
                encodeBits(encodeState, level.SubLengths[i], 4);
            }
            encodeBits(encodeState, level.AllowedCommands, 3);

            encodeBits(encodeState, 0, 5); // Flush
            return encodeState.output;
        };

        decodeDesign(input: string): Level {
            if (!input) {
                return null;
            }

            var decodeState = {
                input: input,
                index: 0,
                val: 0,
                bits: 0
            };

            var version = decodeBits(decodeState, 3);
            if (version != 0) {
                return null;
            }

            let robotColors: string[] = [];
            let robotItems: string[] = [];
            for (let j = 0; j < 12; j++) {
                var colors = '';
                var items = '';
                for (let i = 0; i < 16; i++) {
                    var val = decodeBits(decodeState, 3);
                    if (val == 0) {
                        colors += 'B';
                        items += '#';
                    } else {
                        if (val > 3) {
                            items += '*';
                            val = val - 3;
                        } else {
                            items += '.';
                        }
                        if (val == 1) {
                            colors += 'R';
                        } else if (val == 2) {
                            colors += 'G';
                        } else if (val == 3) {
                            colors += 'B';
                        } else {
                            return null;
                        }
                    }
                }
                robotColors.push(colors);
                robotItems.push(items);
            }

            let robotSubLengths: number[] = [];
            for (let i = 0; i < 5; i++) {
                robotSubLengths.push(decodeBits(decodeState, 4));
            }

            return {
                RobotRow: decodeBits(decodeState, 4),
                RobotCol: decodeBits(decodeState, 4),
                RobotDir: decodeBits(decodeState, 2),
                AllowedCommands: decodeBits(decodeState, 3),
                Title: '',
                About: '',
                Colors: robotColors,
                Items: robotItems,
            }
        };

        submitDesign(callback): void {
            if (!robozzle.design) {
                callback('Invalid puzzle.');
                return;
            }

            if (!robozzle.design.Title) {
                callback('The puzzle title cannot be blank.');
                return;
            }

            if (!robozzle.userName || !robozzle.password) {
                callback('You must sign in to submit puzzles.');
                return;
            }

            var request = {
                level2: {
                    About: robozzle.design.About,
                    AllowedCommands: robozzle.design.AllowedCommands,
                    Colors: robozzle.design.Colors,
                    Items: robozzle.design.Items,
                    RobotCol: robozzle.design.RobotCol,
                    RobotDir: robozzle.design.RobotDir,
                    RobotRow: robozzle.design.RobotRow,
                    SubLengths: robozzle.design.SubLengths,
                    Title: robozzle.design.Title
                },
                userName: robozzle.userName,
                pwd: robozzle.password,
                solution: robozzle.encodeSolution()
            };
            robozzle.service('SubmitLevel2', request, function (result, response) {
                callback(result);
            }, function () {
                callback('Server request failed.');
            });
        };

        readDesign(): Level {
            let robotColors: string[] = [];
            let robotItems: string[] = [];
            for (let j = 0; j < robozzle.board.length; j++) {
                var colors = '';
                var items = '';
                var row = robozzle.board[j];
                for (let i = 0; i < row.length; i++) {
                    var $cell = row[i];

                    var color = $cell.getClass('-color');
                    if (!color) {
                        colors += 'B';
                        items += '#';
                    } else {
                        colors += color;

                        var $item = $cell.find('.tile__item');
                        if ($item.getClass('-item') === 'star') {
                            items += '*';
                        } else {
                            items += '.';
                        }
                    }
                }
                robotColors.push(colors);
                robotItems.push(items);
            }

            let robotSubLengths: number[] = [];
            for (let i = 0; i < 5; i++) {
                var min = i == 0 ? 1 : 0;
                var val = parseInt($('#design-f' + (i + 1)).val());
                if (val < min) {
                    val = min;
                } else if (val > 10) {
                    val = 10;
                }
                robotSubLengths.push(val);
            }

            let robotAllowedCommands = 0;
            if ($('#design-red').prop('checked')) {
                robotAllowedCommands += 1;
            }
            if ($('#design-green').prop('checked')) {
                robotAllowedCommands += 2;
            }
            if ($('#design-blue').prop('checked')) {
                robotAllowedCommands += 4;
            }

            return {
                RobotDir: robozzle.robot.robotDir,
                RobotCol: robozzle.robot.robotCol,
                RobotRow: robozzle.robot.robotRow,
                AllowedCommands: robotAllowedCommands,
                Title: String($('#design-title').val()),
                About: String($('#design-about').val()),
                SubLengths: robotSubLengths,
                Colors: robotColors,
                Items: robotItems,
            }
        };

        displayDesign(): void {
            robozzle.setPageTab('makepuzzle');
            $('#content-game').show();
            $('#content-game').children().hide();
            $('#board-container').show();
            $('#design-toolbar-container').show();
            $('#design-panel-container').show();
            $('#design-selection').show();

            var status = $('#board-status');
            status.find('.board-status__title').text("Designing a puzzle");
            status.find('.board-status__about').text("Design a puzzle, solve it, and then submit it to challenge others.").show();
            status.find('.board-status__stats').hide();
            status.find('.board-status__comments').hide();

            if (!robozzle.design) {
                robozzle.design = getDefaultLevel();
            }
            robozzle.displayBoard(robozzle.design, true);
            robozzle.displayProgram(robozzle.design, robozzle.designProgram);
            $('#design-title').val(robozzle.design.Title);
            $('#design-about').val(robozzle.design.About);
            for (var i = 0; i < 5; i++) {
                $('#design-f' + (i + 1)).val(robozzle.design.SubLengths[i]);
            }
            $('#design-red').prop('checked', robozzle.design.AllowedCommands & 1);
            $('#design-green').prop('checked', robozzle.design.AllowedCommands & 2);
            $('#design-blue').prop('checked', robozzle.design.AllowedCommands & 4);
            robozzle.displayDesignToolbar();
            robozzle.displayTutorial(null);
        };

        moveRobot(): void {
            var crash = false;
            var col = robozzle.robot.robotCol;
            var row = robozzle.robot.robotRow;
            if (robozzle.robot.robotDir == RobotDirection.Right) {
                col++;
                if (col >= robozzle.level.Colors[0].length)
                    crash = true;
            } else if (robozzle.robot.robotDir == RobotDirection.Down) {
                row++;
                if (row >= robozzle.level.Colors.length)
                    crash = true;
            } else if (robozzle.robot.robotDir == RobotDirection.Left) {
                col--;
                if (col < 0)
                    crash = true;
            } else if (robozzle.robot.robotDir == RobotDirection.Up) {
                row--;
                if (row < 0)
                    crash = true;
            }
            if (!crash) {
                robozzle.robot.robotCol = col;
                robozzle.robot.robotRow = row;

                var $cell = robozzle.board[row][col];
                var color = $cell.getClass('-color');
                if (!color)
                    crash = true;

                var $item = $cell.find('.tile__item');
                if ($item.getClass('-item') === 'star') {
                    $item.animate({ opacity: 0 }, robozzle.robot.robotDelay)
                        .updateClass('-item', 'starfade');
                    robozzle.stars--;
                }
            }
            robozzle.animateRobot({ left: col * 40, top: row * 40, stack: 0.0 });
            if (crash) {
                robozzle.animateRobot({ scale: 0.0 });
                robozzle.setRobotState(RobotStates.Finished);
            }
            robozzle.stepWait();
        };

        turnRobot(is_right: boolean): void {
            var dir = robozzle.robot.robotDir;
            if (is_right) {
                dir++;
                robozzle.robot.robotDeg += 90;
            } else {
                dir--;
                robozzle.robot.robotDeg -= 90;
            }
            robozzle.robot.robotDir = (dir + 4) % 4;
            robozzle.animateRobot({ deg: robozzle.robot.robotDeg, stack: 0.0 });
            robozzle.stepWait();
        };

        paintTile($cell, color): void {
            $cell.updateClass('-color', color);
            robozzle.stepWait();
        };

        callSub(calls, index: number): void {
            if (calls & (1 << index)) {
                // Infinite loop
                robozzle.setRobotState(RobotStates.Finished);
                return;
            }
            calls |= 1 << index;

            var count = 0;
            var sub = robozzle.program[index];
            for (var j = 0; j < sub.length; j++) {
                var cmd = sub[j].find('.command').getClass('-command');
                if (cmd) {
                    count++;
                }
            }

            if (robozzle.stackBreakpoint) {
                robozzle.stackBreakpoint.index += count;
            }

            // Don't animate the stack when not stepping
            if (robozzle.robot.robotState != RobotStates.Stepping) {
                robozzle.stack.unshift({ sub: index, cmd: 0 });
                robozzle.stepNext(0);
                return;
            }

            // Animate the stack; does the same as the above if statement,
            // but with animation

            if (count) {
                $(robozzle.robot.robotAnimation).queue(function () {
                    $(this).dequeue();
                    robozzle.stack.unshift({ sub: index, cmd: 0 });
                    robozzle.displayStack();
                    robozzle.robot.robotAnimation.stack = 1.0 / count;
                    robozzle.robot.robotAnimation.stackCount = count;
                    robozzle.displayRobot();
                });
                robozzle.animateRobot({ stack: 1.0 });
                $(robozzle.robot.robotAnimation).queue(function () {
                    $(this).dequeue();
                    robozzle.robot.robotAnimation.stackCount = 1;
                    robozzle.stepNext(0);
                });
            } else {
                robozzle.animateRobot({ stack: 0.0 });
                $(robozzle.robot.robotAnimation).queue(function () {
                    $(this).dequeue();
                    robozzle.stack.unshift({ sub: index, cmd: 0 });
                    robozzle.stepNext(0);
                });
            }
        };

        stepReset(): void {
            if (robozzle.robot.robotState != RobotStates.Reset) {
                $(robozzle.robot.robotAnimation).stop(true, false);
                $('.-program-highlight').removeClass('-program-highlight');
                $('#program-stack').empty();
                robozzle.displayBoard(robozzle.level, false);
            }
        };

        stepWait(): void {
            if (robozzle.robot.robotState == RobotStates.Finished) {
                return;
            }
            if (robozzle.starsMax > 0 && robozzle.stars == 0) {
                $(robozzle.robot.robotAnimation).queue(function () {
                    if (robozzle.level.Id) {
                        robozzle.submitSolution();
                        if (isTutorialLevel(robozzle.level.Id)) {
                            robozzle.showTutorialSolved();
                        } else {
                            robozzle.showSolved();
                        }
                    } else {
                        robozzle.showDesignSolved();
                    }
                    $(this).dequeue();
                });
                robozzle.setRobotState(RobotStates.Finished);
                return;
            }
            robozzle.steps++;
            if (robozzle.steps >= 1000) {
                $(robozzle.robot.robotAnimation).queue(function () {
                    robozzle.showMessage('Out of fuel!',
                        'You must solve the puzzle in at most 1000 steps.');
                    $(this).dequeue();
                });
                robozzle.setRobotState(RobotStates.Finished);
                return;
            }
            $(robozzle.robot.robotAnimation).queue(function () {
                $(this).dequeue();
                robozzle.stepNext(0);
            });
        };

        currentCommand(): JQuery<HTMLElement> {
            if (!robozzle.stack.length) {
                return null;
            }
            var $cmd = robozzle.program[robozzle.stack[0].sub][robozzle.stack[0].cmd];
            if ($cmd != null) {
                return $cmd;
            }
            robozzle.stack.shift();
            return robozzle.currentCommand();
        };

        stepExecute(next, calls): void {
            // Clear highlight on previous command
            $(robozzle.robot.robotAnimation).queue(function () {
                $('.-program-highlight').removeClass('-program-highlight');
                robozzle.displayStack();
                $(this).dequeue();
            });

            // Get the current command, if none then we're finished
            var $cmd = robozzle.currentCommand();
            if (!$cmd) {
                robozzle.setRobotState(RobotStates.Finished);
                return;
            }

            // Highlight the current command
            $(robozzle.robot.robotAnimation).queue(function () {
                $cmd.addClass('-program-highlight');
                $(this).dequeue();
            });

            // Check if we hit a breakpoint on the previous command
            if (next) {
                if (robozzle.boardBreakpoint
                    && robozzle.robot.robotCol === robozzle.boardBreakpoint.col
                    && robozzle.robot.robotRow === robozzle.boardBreakpoint.row) {
                    robozzle.setRobotState(RobotStates.Stepping);
                    robozzle.boardBreakpoint = null;
                }
                if (robozzle.stackBreakpoint
                    && robozzle.stackBreakpoint.index == 0) {
                    robozzle.setRobotState(RobotStates.Stepping);
                    robozzle.stackBreakpoint = null;
                }
            }

            // Check if we're still running
            if (robozzle.robot.robotState == RobotStates.Stepping) {
                // Stop on the next command in single step mode
                if (next) {
                    robozzle.setRobotState(RobotStates.Stopped);
                    return;
                }
            } else if (robozzle.robot.robotState != RobotStates.Started) {
                return;
            }

            var cond = $cmd.getClass('-condition');
            var cmd = $cmd.find('.command').getClass('-command');
            var $cell = robozzle.board[robozzle.robot.robotRow][robozzle.robot.robotCol];
            var color = $cell.getClass('-color');
            robozzle.stack[0].cmd++;
            if (robozzle.stackBreakpoint) {
                robozzle.stackBreakpoint.index--;
            }
            if (cond == 'any' || cond == color) {
                switch (cmd) {
                    case 'f': robozzle.moveRobot(); break;
                    case 'l': robozzle.turnRobot(false); break;
                    case 'r': robozzle.turnRobot(true); break;
                    case '1': robozzle.callSub(calls, 0); break;
                    case '2': robozzle.callSub(calls, 1); break;
                    case '3': robozzle.callSub(calls, 2); break;
                    case '4': robozzle.callSub(calls, 3); break;
                    case '5': robozzle.callSub(calls, 4); break;
                    case 'R': robozzle.paintTile($cell, 'R'); break;
                    case 'G': robozzle.paintTile($cell, 'G'); break;
                    case 'B': robozzle.paintTile($cell, 'B'); break;
                }
            } else {
                if (robozzle.robot.robotState == RobotStates.Stepping) {
                    robozzle.animateRobot({ stack: 0.0 });
                    $(robozzle.robot.robotAnimation).queue(function () {
                        $(this).dequeue();
                        robozzle.stepNext(0);
                    });
                } else {
                    robozzle.stepNext(calls);
                }
            }
        };

        stepStart(): void {
            robozzle.stepExecute(false, 0);
        };

        stepNext(calls): void {
            robozzle.stepExecute(true, calls);
        };

        setBoardBreakpoint(row: number, col: number): void {
            robozzle.boardBreakpoint = { row: row, col: col };
            if (robozzle.robot.robotState == RobotStates.Reset
                || robozzle.robot.robotState == RobotStates.Stopped) {
                robozzle.setRobotState(RobotStates.Started);
                robozzle.stepStart();
            }
        };

        setStackBreakpoint(index: number): void {
            robozzle.stackBreakpoint = { index: index };
            if (robozzle.robot.robotState == RobotStates.Reset
                || robozzle.robot.robotState == RobotStates.Stopped) {
                robozzle.setRobotState(RobotStates.Started);
                robozzle.stepStart();
            }
        };

        hashPassword(password: string): string {
            var salt = '5A6fKpgSnXoMpxbcHcb7';
            return CryptoJS.SHA1(password + salt).toString();
        };

        setUserName(userName: string, password: string, solvedLevels, votes): void {
            // Store the response
            robozzle.userName = userName;
            robozzle.password = password;
            robozzle.solvedLevels = {};
            if (solvedLevels != null) {
                $.each(solvedLevels, function (index, value) {
                    robozzle.solvedLevels[parseInt(value)] = true;
                });
            }
            robozzle.likeVotes = {};
            robozzle.difficultyVotes = {};
            if (votes != null) {
                $.each(votes, function (index, value) {
                    if (value.VoteKind === '0') {
                        robozzle.likeVotes[value.LevelId] = value.Vote;
                    } else if (value.VoteKind === '1') {
                        robozzle.difficultyVotes[value.LevelId] = value.Vote;
                    }
                });
            }

            localStorage.setItem('userName', userName);
            localStorage.setItem('password', password);

            // Update the display
            $('#menu-signin').hide();
            $('#menu-register').hide();
            $('#menu-user').show()
                .find('a')
                .attr('href', '/user.aspx?name=' + encodeURIComponent(userName))
                .text(userName);
            $('#menu-signout').show();
            robozzle.displayLevels();
        };

        /*
         * TODO:
         * <solvedLevels xmlns:d4p1="http://schemas.microsoft.com/2003/10/Serialization/Arrays" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><d4p1:KeyValueOfintstring><d4p1:Key>27</d4p1:Key><d4p1:Value>_F_L_F_R_1|||||</d4p1:Value></d4p1:KeyValueOfintstring></solvedLevels>
        */

        register(userName: string, password: string, email: string, callback): void {
            var request = {
                userName: userName,
                password: password,
                email: email,
                solvedLevels: []
            };
            robozzle.service('RegisterUser2', request, function (result, response) {
                if (result === null) {
                    robozzle.setUserName(userName, password, [], []);
                }
                callback(result);
            }, function () {
                callback('Server request failed.');
            });
        };

        logIn(userName: string, password: string, callback): void {
            // Build the request
            var request = {
                userName: userName,
                password: password
            };

            // Handle the response in a callback so it can be cancelled if needed
            var callbacks = $.Callbacks();
            callbacks.add(function (result, response) {
                if (result === 'true') {
                    robozzle.setUserName(userName, password, response.solvedLevels, response.votes.LevelVoteInfo);
                    callback(true);
                } else {
                    callback(false);
                }
            });

            // Send the request
            robozzle.service('LogIn', request, function (result, response) {
                callbacks.fire(result, response).empty();
            }, function () {
                callbacks.fire(false, null).empty();
            });
            robozzle.logInCallbacks = callbacks;
        };

        logInCancel(): void {
            if (robozzle.logInCallbacks) {
                robozzle.logInCallbacks.empty();
            }
        };

        logOut(): void {
            robozzle.userName = null;
            robozzle.password = null;
            robozzle.solvedLevels = {};
            robozzle.votes = {};

            localStorage.removeItem('userName');
            localStorage.removeItem('password');

            $('#menu-signout').hide();
            $('#menu-user').hide()
                .find('a').removeAttr('href').text('');
            $('#menu-register').show();
            $('#menu-signin').show();
            robozzle.displayLevels();
        };

        showDialog($dialog, cancel): void {
            $('#dialog-modal').show();
            $('#dialogs').show();
            $dialog.show();
            $dialog.find(":input:first").focus();
            // TODO: prevent focus leaving the dialog

            robozzle.cancelDialogCallback = function () {
                cancel.click();
            };
        };

        hideDialog($dialog): void {
            $dialog.hide();
            $('#dialogs').hide();
            $('#dialog-modal').hide();
            robozzle.cancelDialogCallback = null;
        };

        cancelDialog(): void {
            if (robozzle.cancelDialogCallback) {
                robozzle.cancelDialogCallback();
            }
        };

        showMessage(title: string, message: string): void {
            var $dialog = $('#dialog-message');
            $dialog.find('.dialog-title').text(title);
            $dialog.find('.dialog-message').text(message);
            robozzle.showDialog($dialog, $('dialog-message-ok'));
        };

        submitMessage(event): void {
            event.preventDefault();
            robozzle.hideDialog($('#dialog-message'));
        };

        initMessage(): void {
            $('#dialog-message').find('form').on('submit', robozzle.submitMessage);
        };

        showRegister(): void {
            var $register = $('#dialog-register');
            $register.find(':input').prop('disabled', false);
            $('#dialog-register-error').hide();
            robozzle.showDialog($register, $('#dialog-register-cancel'));
        };

        hideRegister(): void {
            var $register = $('#dialog-register');
            robozzle.hideDialog($register);
            $register.find('input[name="name"]').val('');
            $register.find('input[name="password"]').val('');
            $register.find('input[name="password2"]').val('');
            $register.find('input[name="email"]').val('');
        };

        submitRegister(event): void {
            event.preventDefault();
            var $register = $('#dialog-register');

            var name = String($register.find('input[name="name"]').val());
            if (name.length < 4 || name.length > 14) {
                $('#dialog-register-error').text('Username must be 4-14 characters long.').show();
                return;
            }
            if (/[^A-Za-z0-9_]/.exec(name)) {
                $('#dialog-register-error').text('Username characers alllowed: A-Z, 0-9, _.').show();
                return;
            }

            var password = String($register.find('input[name="password"]').val());
            if (password.length < 4 || password.length > 20) {
                $('#dialog-register-error').text('Password must be 4-20 characters long.').show();
                return;
            }

            var password2 = $register.find('input[name="password2"]').val();
            if (password !== password2) {
                $('#dialog-register-error').text('Passwords do not match.').show();
                return;
            }

            var email = String($register.find('input[name="email"]').val());

            $register.find(':input').prop('disabled', true);
            robozzle.register(name, robozzle.hashPassword(password), email,
                function (result) {
                    $register.find(':input').prop('disabled', false);
                    if (result === null) {
                        robozzle.hideRegister();
                    } else {
                        $('#dialog-register-error').text(result).show();
                    }
                });
        };

        cancelRegister(event): void {
            event.preventDefault();
            robozzle.hideRegister();
        };

        initRegister(): void {
            $('#dialog-register').find('form').on('submit', robozzle.submitRegister);
            $('#dialog-register-cancel').on('click', robozzle.cancelRegister);
        };

        showSignin(): void {
            var $signin = $('#dialog-signin');
            $signin.find(':input').prop('disabled', false);
            $('#dialog-signin-error').hide();
            robozzle.showDialog($signin, $('#dialog-signin-cancel'));
        };

        hideSignin(): void {
            var $signin = $('#dialog-signin');
            robozzle.hideDialog($signin);
            $signin.find('input[name="password"]').val('');
        };

        submitSignin(event): void {
            event.preventDefault();
            var $signin = $('#dialog-signin');
            $signin.find(':input').prop('disabled', true);
            $('#dialog-signin-cancel').prop('disabled', false);
            robozzle.logIn(
                $signin.find('input[name="name"]').val(),
                robozzle.hashPassword($signin.find('input[name="password"]').val()),
                function (result) {
                    $signin.find(':input').prop('disabled', false);
                    if (result) {
                        robozzle.hideSignin();
                    } else {
                        $('#dialog-signin-error').show();
                    }
                });
        };

        cancelSignin(event): void {
            event.preventDefault();
            robozzle.logInCancel();
            robozzle.hideSignin();
        };

        initSignin(): void {
            $('#dialog-signin').find('form').on('submit', robozzle.submitSignin);
            $('#dialog-signin-cancel').on('click', robozzle.cancelSignin);
        };

        displaySolvedVote(): void {
            var text = $('#dialog-solved-difficulty input:checked + label span').first().text();
            if (text) {
                text = 'Your vote: ' + text;
            } else {
                text = 'Please vote on the difficulty';
            }
            $('#dialog-solved-difficulty-label').text(text);
        };

        displaySolvedLiked(): void {
            var $solved = $('#dialog-solved');
            var liked = robozzle.level.Liked;
            var disliked = robozzle.level.Disliked;
            vote = robozzle.likeVotes[robozzle.level.Id];
            if (vote == '1') {
                liked--;
            } else if (vote == '-1') {
                disliked++;
            }
            if ($('#dialog-solved-like').prop('checked')) {
                liked++;
            }
            if ($('#dialog-solved-dislike').prop('checked')) {
                disliked++;
            }
            $solved.find('span.liked').text('+' + liked);
            $solved.find('span.disliked').text('-' + disliked);
        };

        showSolved(): void {
            var $solved = $('#dialog-solved');
            if (robozzle.userName) {
                $('#dialog-solved-difficulty').find('input').prop('checked', false);
                var vote = robozzle.difficultyVotes[robozzle.level.Id];
                var $difficulty = $('#dialog-solved-difficulty');
                if (vote) {
                    $difficulty.find('input[value="' + vote + '"]').prop('checked', true);
                    $difficulty.find('.difficulty-input__val').updateClass('-difficulty-val', 'user');
                } else {
                    robozzle.displayDifficulty(robozzle.level, $difficulty, '.difficulty-input__val');
                }

                $('#dialog-solved-like').prop('checked', false);
                $('#dialog-solved-dislike').prop('checked', false);
                vote = robozzle.likeVotes[robozzle.level.Id];
                if (vote == '1') {
                    $('#dialog-solved-like').prop('checked', true);
                } else if (vote == '-1') {
                    $('#dialog-solved-dislike').prop('checked', true);
                }

                robozzle.displaySolvedVote();
                robozzle.displaySolvedLiked();

                $('#dialog-solved-message').hide();
                $('#dialog-solved-form').show();
            } else {
                $('#dialog-solved-message').show();
                $('#dialog-solved-form').hide();
            }
            $solved.find('a.stats')
                .attr('href', '/puzzle.aspx?id=' + robozzle.level.Id)
                .attr('target', '_blank');
            $solved.find('a.comments')
                .attr('href', '/forums/thread.aspx?puzzle=' + robozzle.level.Id)
                .attr('target', '_blank');
            robozzle.showDialog($solved, $('#dialog-solved-replay'));
        };

        submitSolved(event): void {
            event.preventDefault();
            robozzle.hideDialog($('#dialog-solved'));
            robozzle.submitLevelVote();
            robozzle.navigateIndex();
        };

        cancelSolved(event): void {
            event.preventDefault();
            robozzle.hideDialog($('#dialog-solved'));
            robozzle.submitLevelVote();
        };

        initSolved(): void {
            $('#dialog-solved').find('form').on('submit', robozzle.submitSolved);
            $('#dialog-solved-replay').on('click', robozzle.cancelSolved);
            $('#dialog-solved-difficulty label').mouseenter(function () {
                $('#dialog-solved-difficulty-label').text($(this).find('span').text());
            }).mouseleave(function () {
                robozzle.displaySolvedVote();
            });
            $('input[name="difficulty"]').change(function () {
                $('#dialog-solved-difficulty').find('.difficulty-input__val').updateClass('-difficulty-val', 'user');
                robozzle.displaySolvedVote();
            });
            $('#dialog-solved-like').change(function () {
                if ($(this).prop('checked')) {
                    $('#dialog-solved-dislike').prop('checked', false);
                }
                robozzle.displaySolvedLiked();
            });
            $('#dialog-solved-dislike').change(function () {
                if ($(this).prop('checked')) {
                    $('#dialog-solved-like').prop('checked', false);
                }
                robozzle.displaySolvedLiked();
            });
        };

        showDesignSolved(): void {
            var $dialog = $('#dialog-design-solved');
            $dialog.find(':input').prop('disabled', false);
            $('#dialog-design-solved-error').hide();
            robozzle.showDialog($dialog, $('#dialog-design-solved-edit'));
        };

        submitDesignSolved(event): void {
            event.preventDefault();
            var $dialog = $('#dialog-design-solved');
            $dialog.find(':input').prop('disabled', true);
            $('#dialog-design-solved-edit').prop('disabled', false);
            robozzle.submitDesign(
                function (result) {
                    $dialog.find(':input').prop('disabled', false);
                    if (result === null) {
                        robozzle.hideDialog($dialog);
                        robozzle.navigateIndex();
                    } else {
                        $('#dialog-design-solved-error').text(result).show();
                    }
                });
        };

        cancelDesignSolved(event): void {
            event.preventDefault();
            robozzle.hideDialog($('#dialog-design-solved'));
        };

        initDesignSolved(): void {
            $('#dialog-design-solved').find('form').on('submit', robozzle.submitDesignSolved);
            $('#dialog-design-solved-edit').on('click', robozzle.cancelDesignSolved);
        };

        showTutorialSolved(): void {
            var $dialog = $('#dialog-tutorial-solved');
            var title, message;
            var register = false;
            if (robozzle.level.NextId) {
                title = "Congratulations!";
                message = "You got it! Let's move on to the next part of the tutorial.";
            } else {
                title = "Tutorial Completed";
                message = "But, that's just the beginning! The real game is tackling the puzzles submitted by other players.";
                if (!robozzle.userName) {
                    message += '<br><br>Now, it is a good time to register. Only takes seconds, and will track puzzles you solved, add you to the scoreboard, and allow you to vote on puzzles.'
                    register = true;
                }
            }
            $dialog.find('.dialog-title').text(title);
            $dialog.find('.dialog-message').html(message);
            if (register) {
                $('#dialog-tutorial-solved-register').show();
            } else {
                $('#dialog-tutorial-solved-register').hide();
            }
            robozzle.showDialog($dialog, $('#dialog-tutorial-solved-continue'));
        };

        submitTutorialSolved(event): void {
            event.preventDefault();
            var $dialog = $('#dialog-tutorial-solved');
            robozzle.hideDialog($dialog);
            if (robozzle.level.NextId) {
                robozzle.navigatePuzzle(robozzle.level.NextId);
            } else {
                robozzle.setSortKind(0);
                robozzle.setPageIndex(0);
                robozzle.navigateIndex();
            }
        };

        registerTutorialSolved(event): void {
            robozzle.submitTutorialSolved(event);
            robozzle.showRegister();
        };

        initTutorialSolved(): void {
            $('#dialog-tutorial-solved').find('form').on('submit', robozzle.submitTutorialSolved);
            $('#dialog-tutorial-solved-register').on('click', robozzle.registerTutorialSolved);
        };

        parseUrl(): void {
            var urlParams = {};
            var query = window.location.search.substring(1);
            var search = /([^&=]+)=?([^&]*)/g;
            var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
            var match;
            while (match = search.exec(query)) {
                urlParams[decode(match[1])] = decode(match[2]);
            }

            if ('puzzle' in urlParams) {
                robozzle.setGame(urlParams['puzzle'], decodeProgram(urlParams['program']));
            } else if ('design' in urlParams) {
                robozzle.designProgram = decodeProgram(urlParams['program']);
                robozzle.design = robozzle.decodeDesign(urlParams['design']);
                robozzle.displayDesign();
            } else {
                robozzle.getLevels(false);
            }
        };

        navigateUrl(url): void {
            if (robozzle.urlTimeout) {
                window.clearTimeout(robozzle.urlTimeout);
                robozzle.urlCallback();
                robozzle.urlTimeout = null;
                robozzle.urlCallback = null;
            }

            history.pushState({}, "", url);
            robozzle.parseUrl();
        };

        setUrl(callback): void {
            if (robozzle.urlTimeout) {
                window.clearTimeout(robozzle.urlTimeout);
            }
            robozzle.urlCallback = function () {
                history.replaceState({}, "", callback());
            };
            robozzle.urlTimeout = window.setTimeout(function () {
                robozzle.urlCallback();
                robozzle.urlTimeout = null;
                robozzle.urlCallback = null;
            }, 1000);
        };

        navigateIndex(): void {
            robozzle.navigateUrl("index.html");
        };

        navigatePuzzle(id: string): void {
            robozzle.navigateUrl("index.html?puzzle=" + id);
        };

        navigateDesign(): void {
            robozzle.navigateUrl("index.html?design=");
        };

        setPuzzleUrl(id: string, program_string: string): void {
            robozzle.setUrl(function () {
                return "index.html?puzzle=" + id + "&program=" + program_string;
            });
        };

        setDesignUrl(design_string: string, program_string: string): void {
            robozzle.setUrl(function () {
                return "index.html?design=" + design_string + '&program=' + program_string;
            });
        };

        updatePuzzleUrl(): void {
            if (robozzle.level.Id) {
                robozzle.setPuzzleUrl(robozzle.level.Id, encodeProgram(robozzle.program));
            } else {
                robozzle.setDesignUrl(robozzle.encodeDesign(robozzle.design), encodeProgram(robozzle.program));
            }
        };

        updateDesignUrl(): void {
            robozzle.setDesignUrl(robozzle.encodeDesign(robozzle.readDesign()), encodeProgram(robozzle.program));
        };

        setPageTab(name: string): void {
            robozzle.stepReset();
            $('.page-menu__item').removeClass('-active');
            $('.page-content__tab').hide();
            if (name) {
                $('#menu-' + name).addClass('-active');
                $('#content-' + name).show();
            }
        };

    }

    var robozzle = new Robozzle();

    (function ($) {
        $.fn.updateClass = function (classBase, classVal) {
            var pattern = new RegExp('(^|\\s)' + classBase + '-[A-Za-z0-9]+', 'g');
            this.attr('class',
                function (i, c) {
                    return c.replace(pattern, '');
                });
            return classVal === null ? this : this.addClass(classBase + '-' + classVal);
        };
    })(jQuery);

    (function ($) {
        $.fn.getClass = function (classBase) {
            var pattern = new RegExp('(^|\\s)' + classBase + '-([A-Za-z0-9]+)');
            var result = pattern.exec(this.attr('class'));
            return result === null ? null : result[2];
        };
    })(jQuery);

    (function ($) {
        $.fn.pointerEventsNone = function () {
            this.addClass('pointer-events-none').css('pointer-events', 'none');
            var fixTarget = function (oldTarget, e) {
                oldTarget.hide();
                e.target = document.elementFromPoint(e.clientX, e.clientY);
                if ($(e.target).closest('.pointer-events-none').length) {
                    fixTarget($(e.target), e);
                }
                oldTarget.show();
            };
            this.on('click mousedown mouseup mousemove', function (e) {
                fixTarget($(this), e);
                $(e.target).trigger(e);
                return false;
            });
            return this;
        };
    })(jQuery);


    $(document).ready(function () {
        $('#pagefirst').click(function () {
            robozzle.setPageIndex(0);
            robozzle.getLevels(false);
        });
        $('#pageprev').click(function () {
            robozzle.setPageIndex(robozzle.pageIndex - robozzle.pageSize);
            robozzle.getLevels(false);
        });
        $('#pagenext').click(function () {
            robozzle.setPageIndex(robozzle.pageIndex + robozzle.pageSize);
            robozzle.getLevels(false);
        });
        $('#pagelast').click(function () {
            robozzle.setPageIndex(robozzle.levelCount);
            robozzle.getLevels(false);
        });
        $('#pagecurrent').change(function () {
            robozzle.setPageIndex(parseInt($(this).val()) * robozzle.pageSize - 1);
            robozzle.getLevels(false);
        });
        $('#level-list-refresh').click(function () {
            robozzle.getLevels(true);
        });
        $('#hidesolved').click(function () {
            robozzle.hideSolved = $(this).prop('checked');
            localStorage.setItem('hideSolved', robozzle.hideSolved);
            robozzle.getLevels(false);
        });
        $('.level-sort__item').click(function () {
            robozzle.setSortKind($(this).attr('data-kind'));
            robozzle.setPageIndex(0);
            robozzle.getLevels(false);
        });
        $('#menu-levels').click(function () {
            robozzle.navigateIndex();
        });
        $('#menu-makepuzzle').click(function () {
            var levels_to_design = 40;
            var msg = "Only registered users with at least " + levels_to_design + " solved puzzles can submit new puzzles."
            if (!robozzle.userName) {
                robozzle.showMessage('Please sign in.', msg);
            } else if (Object.keys(robozzle.solvedLevels).length < levels_to_design) {
                robozzle.showMessage('Please solve a few levels first.', msg);
            } else {
                robozzle.navigateDesign();
            }
        });
        $('#tutorial-back').click(function () {
            robozzle.tutorialBack();
        });
        $('#tutorial-continue').click(function () {
            robozzle.tutorialContinue();
        });
        // start/reset button
        $('#program-go').click(function () {
            if (robozzle.robot.robotState == RobotStates.Reset
                || robozzle.robot.robotState == RobotStates.Stopped) {
                robozzle.setRobotState(RobotStates.Started);
                robozzle.stepStart();
            } else if (robozzle.robot.robotState == RobotStates.Stepping) {
                robozzle.setRobotState(RobotStates.Started);
            } else {
                robozzle.stepReset();
            }
        });
        // step button
        $('#program-step').click(function () {
            if (robozzle.robot.robotState == RobotStates.Reset
                || robozzle.robot.robotState == RobotStates.Stopped) {
                robozzle.setRobotState(RobotStates.Stepping);
                robozzle.stepStart();
            } else if (robozzle.robot.robotState == RobotStates.Started) {
                robozzle.robot.robotState = RobotStates.Stepping;
            }
        });
        // start/stop hotkey (x for execute)
        $(document).on('keydown', null, 'x', function () {
            if ($('#program').is(':visible')) {
                if (robozzle.robot.robotState == RobotStates.Reset
                    || robozzle.robot.robotState == RobotStates.Stopped) {
                    robozzle.setRobotState(RobotStates.Started);
                    robozzle.stepStart();
                } else if (robozzle.robot.robotState == RobotStates.Stepping) {
                    robozzle.setRobotState(RobotStates.Started);
                } else if (robozzle.robot.robotState == RobotStates.Started) {
                    robozzle.robot.robotState = RobotStates.Stepping;
                } else {
                    robozzle.stepReset();
                }
            }
        });
        // step hotkey
        $(document).on('keydown', null, 's', function () {
            if ($('#program').is(':visible')) {
                if (robozzle.robot.robotState == RobotStates.Reset
                    || robozzle.robot.robotState == RobotStates.Stopped) {
                    robozzle.setRobotState(RobotStates.Stepping);
                    robozzle.stepStart();
                } else if (robozzle.robot.robotState == RobotStates.Started) {
                    robozzle.robot.robotState = RobotStates.Stepping;
                }
            }
        });
        for (let i = 0; i < 5; i++) {
            $('#design-f' + (i + 1)).change(function () {
                robozzle.updateDesignUrl();
            });
        }
        $('#design-red, #design-green, #design-blue').change(function () {
            robozzle.updateDesignUrl();
        });
        $('#design-solve').click(function () {
            robozzle.design = robozzle.readDesign();
            robozzle.displayGame(robozzle.design, robozzle.designProgram);
        });
        $('#program-edit').click(function () {
            robozzle.designProgram = robozzle.readProgram();
            robozzle.displayDesign();
        });
        $('#program-container, #program-toolbar').on('mousemove', function (e) {
            robozzle.hoverSelection(null, null);
            robozzle.moveSelection(null, e.pageX - 15, e.pageY - 15);
        });
        $('#board-container, #design-toolbar').on('mousemove', function (e) {
            robozzle.hoverDesignSelection(null);
            robozzle.moveDesignSelection(null, e.pageX - 15, e.pageY - 15);
        });
        $('#program-selection, #design-selection').pointerEventsNone();
        $('#board').click(function (e) {
            robozzle.hideSelection();
            e.stopPropagation();
        });
        $(document).click(function () {
            robozzle.hideSelection();
            robozzle.hideDesignSelection();
        });
        $(document).on('keydown', null, 'r', function () {
            robozzle.setSelection('R', null);
            robozzle.setDesignSelection('R', null, null);
        });
        $(document).on('keydown', null, 'g', function () {
            robozzle.setSelection('G', null);
            robozzle.setDesignSelection('G', null, null);
        });
        $(document).on('keydown', null, 'b', function () {
            robozzle.setSelection('B', null);
            robozzle.setDesignSelection('B', null, null);
        });
        $(document).on('keydown', null, 'n', function () {
            robozzle.setSelection('any', null);
        });
        $(document).on('keydown', null, 'q', function () {
            robozzle.setSelection(null, 'l');
        });
        $(document).on('keydown', null, 'w', function () {
            robozzle.setSelection(null, 'f');
        });
        $(document).on('keydown', null, 'e', function () {
            robozzle.setSelection(null, 'r');
        });
        $(document).on('keydown', null, '1', function () {
            robozzle.setSelection(null, '1');
        });
        $(document).on('keydown', null, '2', function () {
            robozzle.setSelection(null, '2');
        });
        $(document).on('keydown', null, '3', function () {
            robozzle.setSelection(null, '3');
        });
        $(document).on('keydown', null, '4', function () {
            robozzle.setSelection(null, '4');
        });
        $(document).on('keydown', null, '5', function () {
            robozzle.setSelection(null, '5');
        });
        $(document).on('keydown', null, 'shift+r', function () {
            robozzle.setSelection(null, 'R');
        });
        $(document).on('keydown', null, 'shift+g', function () {
            robozzle.setSelection(null, 'G');
        });
        $(document).on('keydown', null, 'shift+b', function () {
            robozzle.setSelection(null, 'B');
        });
        $(document).on('keydown', null, 's', function () {
            robozzle.setDesignSelection(null, 'star', null);
        });
        $(document).on('keydown', null, 'x', function () {
            robozzle.setDesignSelection(null, 'erase', null);
        });
        $(document).keydown(function (e) {
            if (e.keyCode == 27) {
                robozzle.cancelDialog();
                robozzle.hideSelection();
                robozzle.hideDesignSelection();
                robozzle.stepReset();
            }
        });

        robozzle.initMessage();
        robozzle.initRegister();
        robozzle.initSignin();
        robozzle.initSolved();
        robozzle.initDesignSolved();
        robozzle.initTutorialSolved();

        $('#menu-register').on('click', robozzle.showRegister);
        $('#menu-signin').on('click', robozzle.showSignin);
        $('#menu-signout').on('click', robozzle.logOut);

        var hideSolved = localStorage.getItem('hideSolved');
        if (hideSolved != null) {
            robozzle.hideSolved = hideSolved === 'true';
            $('#hidesolved').prop('checked', robozzle.hideSolved);
        }

        var setRobotSpeed = function (robotSpeed_str: string) {
            let robotSpeed = parseInt(robotSpeed_str);
            if (isNaN(robotSpeed) || robotSpeed < 0 || robotSpeed > 10) {
                robotSpeed = 5;
            }
            robozzle.robot.robotSpeed = robotSpeed;
            // 0 -> 1020, 5 -> 145, 10 -> 20
            robozzle.robot.robotDelay = Math.pow(10 - robozzle.robot.robotSpeed, 3) + 20;
        };
        setRobotSpeed(localStorage.getItem('robotSpeed'));
        $('#program-speed').val(robozzle.robot.robotSpeed).change(function () {
            setRobotSpeed(String($(this).val()));
            localStorage.setItem('robotSpeed', String(robozzle.robot.robotSpeed));
        });

        window.onpopstate = robozzle.parseUrl;

        robozzle.setPageTab('levels');
        robozzle.setSortKind(localStorage.getItem('sortKind'));
        robozzle.setPageIndex(localStorage.getItem('pageIndex'));

        // Hack to avoid clamping pageIndex
        robozzle.levelCount = robozzle.pageIndex * robozzle.pageSize;

        var userName = localStorage.getItem('userName');
        var password = localStorage.getItem('password');
        if (userName !== null && password !== null) {
            var spinner = new Spinner({ zIndex: 99 }).spin($('#level-list-spinner')[0]);
            robozzle.logIn(userName, password, function (result) {
                spinner.stop();
                robozzle.parseUrl();
                robozzle.topSolvers();
            });
        } else {
            robozzle.parseUrl();
            robozzle.topSolvers();
        }
    });

}