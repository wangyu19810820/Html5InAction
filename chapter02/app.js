(function(){
    var init = function() {
        // h5可以通过submit按钮的属性，重新指定form的url，并且无需做表单验证
        // 不支持h5的浏览器，可通过js模拟此行为
        var orderForm = document.forms.order,
            saveBtn = document.getElementById('saveOrder'),
            saveBtnClicked = false;
        var saveForm = function() {
            if (!('formAction' in document.createElement('input'))) {
                // formAction是h5中submit按钮的属性，指明表单提交路径。如无此属性，证明该浏览器不支持此h5功能。
                var formAction = saveBtn.getAttribute('formaction');
                // 通过传统的js方式，修改表单属性
                orderForm.setAttribute('action', formAction);
            }
            saveBtnClicked = true;
        }
        saveBtn.addEventListener('click', saveForm, false);

        // 用户输入购买商品数量后，计算并显示所需金额
        // 验证h5的技术，和dom相关：从<input type=number>通过属性valueAsNumber，获取数字值
        // 取出data-price属性中的值：someField.dataset.price
        // 给<output>赋值：orderTotalField.value = xx
        var qtyFields = orderForm.quantity,
            totalFields = document.getElementsByClassName('item_total'),
            orderTotalField = document.getElementById('order_total');

        var formatMoney = function(value) {
            // 格式化金额：$XX,XXX,XXX.XX
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            // return value;
        }
        var calculateTotals = function() {
            var i = 0,
                ln = qtyFields.length,
                        itemQty = 0,
                        itemPrice = 0.00,
                        itemTotal = 0.00,
                        itemTotalMoney = '$0.00',
                        orderTotal = 0.00,
                        orderTotalMoney = '$0.00';
            for(; i < ln; i++) {
                // h5中，直接取出<input type=number>中的数字值，不支持h5的浏览器仍然采用parseFloat
                if (!!qtyFields[i].valueAsNumber) {
                    itemQty = qtyFields[i].valueAsNumber || 0;
                } else {
                    itemQty = parseFloat(qtyFields[i].value) || 0;
                }
                // h5中，直接取出data-price属性中的值，不支持h5的浏览器通过getAttribute('data-price')
                if (!!qtyFields.dataset) {
                    itemPrice = parseFloat(qtyFields[i].dataset.price);
                } else {
                    itemPrice = parseFloat(qtyFields[i].getAttribute('data-price'));
                }
                
                itemTotal = itemQty * itemPrice;
                itemTotalMoney = '$' + formatMoney(itemTotal.toFixed(2));

                orderTotal += itemTotal;
                orderTotalMoney = '$' + formatMoney(orderTotal.toFixed(2));

                // h5中，直接给<output>赋值，不支持h5的浏览器通过innerHTML赋值
                if (!!totalFields[i].value) {
                    totalFields[i].value = itemTotalMoney;
                    orderTotalField.value = orderTotalMoney;
                } else {
                    totalFields[i].innerHTML = itemTotalMoney;
                    orderTotalField.innerHTML = orderTotalMoney;
                }

            }
        }
        calculateTotals();

        var qtyListeners = function() {
            var i = 0,
                ln = qtyFields.length;
            for (; i < ln; i++) {
                // <input type=number>添加事件，每次用户调整购买商品数量，都可以重新计算并显示所需金额
                qtyFields[i].addEventListener('input', calculateTotals, false);
                qtyFields[i].addEventListener('keyup', calculateTotals, false);
            }
        }
        qtyListeners();

        // 显示表单验证信息
        
    }
    window.addEventListener('load', init, false);


})();



