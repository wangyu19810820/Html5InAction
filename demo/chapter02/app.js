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
        var doCustomValidity = function(field, msg) {
             if ('setCustomValidity' in field) {
                field.setCustomValidity(msg);
            } else {
                field.validationMessage = msg;
            }
        }
        var validateForm = function() {
            doCustomValidity(orderForm.name, "");
            doCustomValidity(orderForm.password, "");
            doCustomValidity(orderForm.confirm_password, "");
            doCustomValidity(orderForm.card_name, "");

            if (!Modernizr.input.required || !Modernizr.input.pattern) {
                // 不支持h5验证的回退方案
                fallbackValidation();
            }
            if (orderForm.name.value.length < 4) {
                doCustomValidity(orderForm.name, "Full name must be at least 4 charactoers long");
            }
            if (orderForm.password.value.length < 8) {
                doCustomValidity(orderForm.password, "Password must be at least 8 charactors long");
            }
            if (orderForm.password.value != orderForm.confirm_password.value) {
                doCustomValidity(orderForm.confirm_password, "Confirm Password must match Password");
            }
            if (orderForm.card_name.value.length < 4) {
                doCustomValidity(orderForm.card_name, "Name on Card must be at least 4 characters long");
            }
        }
        
        orderForm.addEventListener('input', validateForm, false);
        orderForm.addEventListener('keyup', validateForm, false);
        
        // 监听表单的invalid事件
        var styleInvalidForm = function() {
            orderForm.className = 'invalid';
        }
        orderForm.addEventListener('invalid', styleInvalidForm, true);

        // 用Modernizr引入monthpicker.js，使不支持<input type="month">的浏览器，也能“正常”显示
        // Modernizr是检测浏览器是否支持web新特性的常用库，http://modernizr.cn/
        // 根据Modernizr检测结果，为旧浏览器提供回退方案，称为polyfill。
        // github上有多个现成回退方案。https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills
        Modernizr.load({
            test: Modernizr.inputtypes.month,
            nope: 'monthpicker.js'
        });

        // 在某些浏览器中，虽然能使用h5新api验证表单字段，但是无法良好显示出错信息
        // 回退方案，借用h5的api（input的validationMessage属性）收集出错信息，手动显示错误信息
        var getFieldLabel = function(field) {
            if ('labels' in field && field.labels.length > 0) {
                return field.labels[0].innerText.trim();
            }
            if (field.parentNode && field.parentNode.tagName.toLowerCase() === 'label') {
                return field.parentNode.innerText.trim();
            }
            return "";
        }
        var submitForm = function(e) {
            // 页面两个按钮，提交表单需做数据校验，保存表单无需做数据校验
            if (!saveBtnClicked) {
                validateForm();
                var i = 0,
                    ln = orderForm.length,
                    field,
                    errors = [],
                    errorFields = [],
                    errorMsg = '';
                for (; i < ln; i++) {
                    field = orderForm[i];
                    if ((!!field.validationMessage && field.validationMessage.length)
                            || (!!field.checkValidity && !field.checkValidity())) {
                        errors.push(getFieldLabel(field) + ":" + field.validationMessage);
                        errorFields.push(field);
                    }
                }
                if (errors.length > 0) {
                    e.preventDefault();
                    errorMsg = errors.join("\n");
                    alert('Please fix the following errors:\n' + errorMsg, 'Error');
                    orderForm.className = 'invalid';
                    errorFields[0].focus();
                }
            }
        }
        orderForm.addEventListener('submit', submitForm, false);

        // 不支持h5的pattern校验，email校验，
        var fallbackValidation = function() {
            var i = 0,
                ln = orderForm.length,
                field;
            for (; i < ln; i++) {
                field = orderForm[i];
                doCustomValidity(field, '');
                // 不支持h5的pattern属性验证，回退方案
                if (field.hasAttribute('pattern')) {
                    var pattern = new RegExp(field.getAttribute('pattern').toString());
                    if (!pattern.test(field.value)) {
                        var msg = 'Please match the requested format.';
                        if (field.hasAttribute('title') && field.getAttribute('title').length > 0) {
                            msg += ' ' + field.getAttribute('title');
                        }
                        doCustomValidity(field, msg);
                    }
                }
                // 不支持h5的<input type="email">的回退方案，未必见效，因为浏览器把控件解析成text了
                if (field.hasAttribute('type')) {
                    if(field.getAttribute('type').toLowerCase() === 'email') {
                        var pattern = new RegExp(/\S+@\S+\.\S+/); 
                        if (!pattern.test(field.value)) {
                            doCustomValidity(field, 'Please enter an email address.');
                        }          
                    }
                }
                // 不支持h5的required属性验证，回退方案
                if (field.hasAttribute('required')){ 
                    if (field.value.length < 1) {
                        doCustomValidity(field, 'Please fill out this field.')
                    }
                }
            }
        }
    }
    window.addEventListener('load', init, false);


})();        








