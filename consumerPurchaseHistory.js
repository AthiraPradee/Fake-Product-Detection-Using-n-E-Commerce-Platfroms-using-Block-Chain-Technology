App = {
    web3Provider: null,
    contracts: {},

    init: async function () {
        return await App.initWeb3();
    },

    initWeb3: function () {
        if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        window.web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function () {
        $.getJSON('product.json', function (data) {
            var productArtifact = data;
            App.contracts.product = TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
            App.bindEvents();
        });
    },

    bindEvents: function () {
        $(document).on('click', '.btn-register', App.getData);
    },

    getData: function (event) {
        event.preventDefault();
        var consumerCode = document.getElementById('consumerCode').value;

        var productInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.product.deployed().then(function (instance) {
                productInstance = instance;

                // Use this if you stored consumer code using fromAscii()
                return productInstance.getPurchaseHistory(web3.utils.fromAscii(consumerCode), { from: account });

                // If you stored as plain string, use below line instead and comment out the above:
                // return productInstance.getPurchaseHistory(consumerCode, { from: account });

            }).then(function (result) {
                var productSNs = [];
                var sellerCodes = [];
                var manufacturerCodes = [];

                for (var k = 0; k < result[0].length; k++) {
                    productSNs[k] = web3.utils.hexToUtf8(result[0][k]);
                }

                for (var k = 0; k < result[1].length; k++) {
                    sellerCodes[k] = web3.utils.hexToUtf8(result[1][k]);
                }

                for (var k = 0; k < result[2].length; k++) {
                    manufacturerCodes[k] = web3.utils.hexToUtf8(result[2][k]);
                }

                var t = "";
                document.getElementById('logdata').innerHTML = "";

                for (var i = 0; i < productSNs.length; i++) {
                    if (sellerCodes[i].trim() === "0") continue;

                    t += `<tr>
                        <td>${productSNs[i]}</td>
                        <td>${sellerCodes[i]}</td>
                        <td>${manufacturerCodes[i]}</td>
                    </tr>`;
                }

                document.getElementById('logdata').innerHTML = t;
                document.getElementById('add').innerHTML = account;

            }).catch(function (err) {
                console.log("Error fetching data:", err.message);
            });
        });
    }
};

$(function () {
    $(window).on('load', function () {
        App.init();
    });
});
