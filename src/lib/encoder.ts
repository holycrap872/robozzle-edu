
export function encodeSOAPObject(SOAPObject, prefix, name, data, depth) {
  var soapObject = new SOAPObject(prefix + name);

  var childObject;
  var childName;
  if (data === null) {
    soapObject.attr('xsi:nil', 'true');
  } else if ($.isArray(data)) {
    prefix = 'ns' + depth;
    soapObject.attr('xmlns:' + prefix, 'http://schemas.microsoft.com/2003/10/Serialization/Arrays');
    for (var i = 0; i < data.length; i++) {
      childName = typeof data[i] == 'number' ? 'int' : 'string';
      childObject = encodeSOAPObject(SOAPObject, prefix + ':', childName, data[i], depth + 1);
      soapObject.appendChild(childObject);
    }
  } else if (typeof data == 'object') {
    prefix = 'ns' + depth;
    soapObject.attr('xmlns:' + prefix, 'http://schemas.datacontract.org/2004/07/RoboCoder.GameState');
    for (childName in data) {
      childObject = encodeSOAPObject(SOAPObject, prefix + ':', childName, data[childName], depth + 1);
      soapObject.appendChild(childObject);
    }
  } else {
    soapObject.val('' + data); // the ''+ is added to fix issues with falsey values.
  }
  return soapObject;
};

export function encodeSOAP(SOAPObject, method, data) {
  var soapObject = new SOAPObject(method);
  soapObject.attr('xmlns', 'http://tempuri.org/');

  var childObject;
  var prefix = '';
  var depth = 1;
  for (var childName in data) {
    childObject = encodeSOAPObject(SOAPObject, prefix, childName, data[childName], depth);
    soapObject.appendChild(childObject);
  }
  return soapObject;
};



export interface StateToEncode {
  output: string,
  val: number,
  bits: number,
}

export function encodeBits(encodeState: StateToEncode, val: number, bits: number): void {
  for (let i = 0; i < bits; i++) {
    if (val & (1 << i)) {
      encodeState.val |= (1 << encodeState.bits);
    }
    encodeState.bits++;
    if (encodeState.bits == 6) {
      let c: string;
      if (encodeState.val < 26) {
        c = String.fromCharCode(97 + encodeState.val);
      } else if (encodeState.val < 52) {
        c = String.fromCharCode(65 + encodeState.val - 26);
      } else if (encodeState.val < 62) {
        c = String.fromCharCode(48 + encodeState.val - 52);
      } else if (encodeState.val < 62) {
        c = '_';
      } else {
        c = '-';
      }
      encodeState.output = encodeState.output + c;
      encodeState.val = 0;
      encodeState.bits = 0;
    }
  }
};


export interface StateToDecode {
  input: string,
  index: number,
  bits: number,
  val: number,
}


export function decodeBits(decodeState: StateToDecode, bits: number): number {
  let val = 0;
  for (let i = 0; i < bits; i++) {
    if (decodeState.bits == 0) {
      let c = decodeState.input.charCodeAt(decodeState.index);
      decodeState.index++;
      if (c >= 97 && c < 97 + 26) {
        decodeState.val = c - 97;
      } else if (c >= 65 && c < 65 + 26) {
        decodeState.val = c - 65 + 26;
      } else if (c >= 48 && c < 48 + 10) {
        decodeState.val = c - 48 + 52;
      } else if (c == 95) {
        decodeState.val = 62;
      } else if (c == 45) {
        decodeState.val = 63;
      } else {
        decodeState.val = 0;
      }
      decodeState.bits = 6;
    }
    if (decodeState.val & (1 << (6 - decodeState.bits))) {
      val |= (1 << i);
    }
    decodeState.bits--;
  }
  return val;
};


export function encodeCommand(encodeState: StateToEncode, cond_str: string, cmd_str: string): void {
  let cond_num: number;
  switch (cond_str) {
    case 'R': cond_num = 1; break;
    case 'G': cond_num = 2; break;
    case 'B': cond_num = 3; break;
    default: cond_num = 0; break;
  }

  var cmd_num: number;
  var sublen = 0;
  var subcmd: number | null = null;
  switch (cmd_str) {
    case 'f': cmd_num = 1; break;
    case 'l': cmd_num = 2; break;
    case 'r': cmd_num = 3; break;
    case '1': cmd_num = 4; subcmd = 0; sublen = 3; break;
    case '2': cmd_num = 4; subcmd = 1; sublen = 3; break;
    case '3': cmd_num = 4; subcmd = 2; sublen = 3; break;
    case '4': cmd_num = 4; subcmd = 3; sublen = 3; break;
    case '5': cmd_num = 4; subcmd = 4; sublen = 3; break;
    case 'R': cmd_num = 5; subcmd = 1; sublen = 2; break;
    case 'G': cmd_num = 5; subcmd = 2; sublen = 2; break;
    case 'B': cmd_num = 5; subcmd = 3; sublen = 2; break;
    default: cmd_num = 0; break;
  }

  encodeBits(encodeState, cond_num, 2);
  encodeBits(encodeState, cmd_num, 3);
  if (sublen) {
    encodeBits(encodeState, subcmd, sublen);
  }
};

export function encodeProgram(program: JQuery<HTMLElement>[][]): string {
  var encodeState = {
    output: '',
    val: 0,
    bits: 0
  };

  encodeBits(encodeState, 0, 3); // Version number = 0
  encodeBits(encodeState, program.length, 3);
  for (var j = 0; j < program.length; j++) {
    var sub = program[j];
    encodeBits(encodeState, sub.length, 4);
    for (var i = 0; i < sub.length; i++) {
      var $cmd = sub[i];
      var cond = $cmd.getClass('-condition');
      var cmd = $cmd.find('.command').getClass('-command');
      encodeCommand(encodeState, cond, cmd);
    }
  }

  encodeBits(encodeState, 0, 5); // Flush
  return encodeState.output;
};


export interface DecodedCommand {
  condition: string | null,
  command: string | null,
}

export function decodeCommand(decodeState: StateToDecode): DecodedCommand {
  var cond_num = decodeBits(decodeState, 2);
  var cond_str: string | null
  switch (cond_num) {
    case 1: cmd_str = 'R'; break;
    case 2: cmd_str = 'G'; break;
    case 3: cmd_str = 'B'; break;
    default: cmd_str = null; break;
  }

  var cmd_num = decodeBits(decodeState, 3);
  var cmd_str: string | null;
  switch (cmd_num) {
    case 1: cmd_str = 'f'; break;
    case 2: cmd_str = 'l'; break;
    case 3: cmd_str = 'r'; break;
    case 4:
      var subcmd = decodeBits(decodeState, 3);
      switch (subcmd) {
        case 0: cmd_str = '1'; break;
        case 1: cmd_str = '2'; break;
        case 2: cmd_str = '3'; break;
        case 3: cmd_str = '4'; break;
        case 4: cmd_str = '5'; break;
        default: cmd_str = null; break;
      }
      break;
    case 5:
      var subcmd = decodeBits(decodeState, 2);
      switch (subcmd) {
        case 1: cmd_str = 'R'; break;
        case 2: cmd_str = 'G'; break;
        case 3: cmd_str = 'B'; break;
        default: cmd_str = null; break;
      }
      break;
    default: cmd_str = null; break;
  }

  return { condition: cond_str, command: cmd_str };
};

export function decodeProgram(input: string): DecodedCommand[][] {
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

  var program: DecodedCommand[][] = [];
  var length = decodeBits(decodeState, 3);
  for (var j = 0; j < length; j++) {
    var sub: DecodedCommand[] = [];
    var sublen = decodeBits(decodeState, 4);
    for (var i = 0; i < sublen; i++) {
      sub.push(decodeCommand(decodeState));
    }
    program.push(sub);
  }

  return program;
};
