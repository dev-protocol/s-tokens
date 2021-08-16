// SPDX-License-Identifier: MPL-2.0
pragma solidity 0.8.7;

// library Base64 {

//     bytes constant private base64stdchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
//     bytes constant private base64urlchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

//     function encode(string memory _str) internal pure returns (string memory) {

//         bytes memory _bs = bytes(_str);
//         uint256 rem = _bs.length % 3;

//         uint256 res_length = (_bs.length + 2) / 3 * 4 - ((3 - rem) % 3);
//         bytes memory res = new bytes(res_length);

//         uint256 i = 0;
//         uint256 j = 0;

//         for (; i + 3 <= _bs.length; i += 3) {
// 			bytes memory tmp = encode3(
//                 uint8(_bs[i]),
//                 uint8(_bs[i+1]),
//                 uint8(_bs[i+2])
//             );
// 			res[j] = tmp[0];
// 			res[j+1] = tmp[1];
// 			res[j+2] = tmp[2];
// 			res[j+3] = tmp[3];

//             j += 4;
//         }

//         if (rem != 0) {
//             uint8 la0 = uint8(_bs[_bs.length - rem]);
//             uint8 la1 = 0;

//             if (rem == 2) {
//                 la1 = uint8(_bs[_bs.length - 1]);
//             }
// 			bytes memory tmp = encode3(la0, la1, 0);
//             res[j] = tmp[0];
//             res[j+1] = tmp[1];
//             if (rem == 2) {
//               res[j+2] = tmp[2];
//             }
//         }

//         return string(res);
//     }

//     function encode3(uint256 a0, uint256 a1, uint256 a2)
//         private
//         pure
//         returns (bytes memory)
//     {

//         uint256 n = (a0 << 16) | (a1 << 8) | a2;

//         uint256 c0 = (n >> 18) & 63;
//         uint256 c1 = (n >> 12) & 63;
//         uint256 c2 = (n >>  6) & 63;
//         uint256 c3 = (n      ) & 63;
// 		bytes memory asciiBytes = new bytes(4);
// 		asciiBytes[0] = base64urlchars[c0];
// 		asciiBytes[1] = base64urlchars[c1];
// 		asciiBytes[2] = base64urlchars[c2];
// 		asciiBytes[3] = base64urlchars[c3];
// 		return asciiBytes;
//     }

// }

library Base64 {
    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // load the table into memory
        string memory table = TABLE;

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        // add some extra buffer at the end required for the writing
        string memory result = new string(encodedLen + 32);

        assembly {
            // set the actual output length
            mstore(result, encodedLen)

            // prepare the lookup table
            let tablePtr := add(table, 1)

            // input ptr
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))

            // result ptr, jump over length
            let resultPtr := add(result, 32)

            // run over the input, 3 bytes at a time
            for {} lt(dataPtr, endPtr) {}
            {
               dataPtr := add(dataPtr, 3)

               // read 3 bytes
               let input := mload(dataPtr)

               // write 4 characters
               mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(18, input), 0x3F)))))
               resultPtr := add(resultPtr, 1)
               mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(12, input), 0x3F)))))
               resultPtr := add(resultPtr, 1)
               mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr( 6, input), 0x3F)))))
               resultPtr := add(resultPtr, 1)
               mstore(resultPtr, shl(248, mload(add(tablePtr, and(        input,  0x3F)))))
               resultPtr := add(resultPtr, 1)
            }

            // padding with '='
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
        }

        return result;
    }
}
