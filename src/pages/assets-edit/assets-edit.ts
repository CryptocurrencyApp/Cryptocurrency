import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular'
import { RestProvider } from "../../providers/rest/rest"
import { Storage } from '@ionic/storage'

/**
 * Generated class for the AssetsEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-assets-edit',
    templateUrl: 'assets-edit.html',
})
export class AssetsEditPage {
    private userAssetsList: any
    private selectableCoinList: any
    private matchedCoinList: any
    private timeoutId: number
    private isInput: boolean
    private isNotFound: boolean
    private selectedCoinName: string
    private userId: string

    constructor(public navCtrl: NavController, public navParams: NavParams, private restProvider: RestProvider, private toastCtrl: ToastController, private storage: Storage) {
        this.storage.get('userId').then(data => {
            this.userId = data
        }).then( () =>
        this.restProvider.getSelectableCoinList()
            .then(data => {
                this.selectableCoinList = data
            })
        ).then( () =>
        this.restProvider.getAssets(this.userId)
            .then(data => {
                this.userAssetsList = data
            })
        )
    }

    getInputCoinName() {
        const timeoutMS = 400
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
            // timeoutMS秒間の入力待機後、画面に描画される
            this.filteringCoinList(this.selectedCoinName.toLowerCase())
            this.isInput = this.selectedCoinName != ""
        }, timeoutMS)
    }

    addCoin(coinId: string) {
        this.selectedCoinName = ''
        this.isInput = this.selectedCoinName != ''

        this.restProvider.postAsset(this.userId, coinId, "0")
            .then(() => {
                this.restProvider.getAssets(this.userId)
                    .then(data => {
                        this.userAssetsList = data
                    })
            })
            .catch(err => {
                    // TODO: 通信エラーとToastの中身を振り分ける
                    let toast = this.toastCtrl.create({
                        message: "既にこのコインは登録されています",
                        duration: 3000
                    })
                    toast.present()
                }
            )

    }

    deleteCoinAsset(coinId: string) {
        this.restProvider.deleteAsset(this.userId, coinId)
            .then(() => {
                let toast = this.toastCtrl.create({
                    message: "削除が完了しました。",
                    duration: 3000
                })
                toast.present()
            })
            .catch(() => {
                let toast = this.toastCtrl.create({
                    message: "削除に失敗しました",
                    duration: 3000,
                })
                toast.present()
            })
            .then(() => {
                this.restProvider.getAssets(this.userId)
                    .then(data => {
                        this.userAssetsList = data
                    })
            })
    }

    editAmount(coinId: string, amount: number) {
        const timeoutMS = 1000
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
            // timeoutMS秒間の入力待機後、編集をAPIに投稿される
            // APIに投稿する
            this.restProvider.putAsset(this.userId, coinId, amount)
                .then(() => {
                    let toast = this.toastCtrl.create({
                        message: "保存完了しました",
                        duration: 2000
                    })
                    toast.present()
                })
                .catch(() => {
                    let toast = this.toastCtrl.create({
                        message: "保存に失敗しました。通信環境をご確認ください",
                        duration: 2000
                    })
                    toast.present()
                })
        }, timeoutMS)
    }

    private filteringCoinList(input: string) {
        const rawCoinList = this.selectableCoinList

        this.matchedCoinList = rawCoinList.filter(element => {
            return element.id.toLowerCase().indexOf(input) > -1 ||
                element.name.toLowerCase().indexOf(input) > -1 ||
                element.symbol.toLowerCase().indexOf(input) > -1
        })

        this.isNotFound = this.matchedCoinList.length <= 0
    }
}
