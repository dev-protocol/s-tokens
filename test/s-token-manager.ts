
// TODO _upgradeToAndCall、_upgradeToAndCallSecureは必要ない
// 　　新しいコントラクトの関数実行したければ、upgradeToしてから独自にやってねという想定

//

// adminをlockupにするか。
// proxy経由でsetApprovalForAll読んだ時、_msgSender()は何が取得できるのか
// デリゲートコールしてて、ストレージはproxyのものだから、proxyじゃなくて通常のウォレットのアドレスが入りそうな気がするが
// (むしろそうじゃないと詰む)

