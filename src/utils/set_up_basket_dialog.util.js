import { use_uniq_count_arr } from '@utils/use_uniq_count_arr.util.js';
import { use_product_promise } from '@utils/use_product_promise.util.js';
import { use_to_count_total_value } from '@utils/use_to_count_total_value.util.js';
import { get_basket } from '@utils/get_basket.util.js';
import deleteSvg from '@svgs/delete.svg';
import { get_correct_currency } from '@utils/get_correct_currency.util.js';
import '@prototypes/map_join.array.js';
import '@components/quantity-counter.web.js';

export const set_up_basket_dialog = () => {
  let isBasketDialogOpen = false;

  const BASKET_DIALOG_MAIN_CLASS = 'basket-content-main';
  const basketNode = document.querySelector('.button-basket');

  const basketDialogCloseButtonNode = document.querySelector('.basket-content-header__close-button');
  const basketDialogNode = document.querySelector('.basket');
  const basketDialogMainNode = document.querySelector('.' + BASKET_DIALOG_MAIN_CLASS);

  const basketContentSubmitTotalValueNode = document.querySelector('.basket-content-submit__total-value');

  const TOTAL_PRODUCT_PRICE_VALUE_CLASS = `${BASKET_DIALOG_MAIN_CLASS}__product-item-content__utils-total-price__value`;
  const handleSetUpTotalPrice = () => {
    const get_total_price = use_to_count_total_value(TOTAL_PRODUCT_PRICE_VALUE_CLASS);
    basketContentSubmitTotalValueNode.innerHTML = get_total_price() + get_correct_currency();
  };

  basketNode.addEventListener('click', () => {
    const [basketValue, basketLength] = get_basket();

    isBasketDialogOpen = !isBasketDialogOpen;
    const basketClassList = basketDialogNode.classList;

    basketClassList.remove('basket--closed');
    if (!basketLength) return (basketDialogMainNode.innerHTML = `<p>No products was added yet.</p>`);
    const uniqCountArr = use_uniq_count_arr(basketValue);
    const promiseAll = use_product_promise(uniqCountArr.map(({ id }) => id));

    promiseAll.then((res) => {
      // basketTotalValueNode
      basketDialogMainNode.innerHTML = res.map_join(
        ({ title, image, price, id }, idx) => `
            <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item' basket-product-id='${id}'>
              <a href='product_details.html?${id}'>
                <img src='${image}' class='${BASKET_DIALOG_MAIN_CLASS}__product-item__preview-img'> </img>
              </a>
              <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content'>
                <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__header'>
                  <p class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__header-title'>
                    ${title}
                  </p>
                <button class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__header-delete-button' id-which-should-be-deleted='${id}'>
                  ${deleteSvg}
                </button>

                </div>
                <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__utils'>
                  <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__utils-price'>
                    <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__utils-price__caption'>
                    Price:
                    </div>
                    <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__utils-price__value'>
                      ${price.toFixed(1)}${get_correct_currency()}
                    </div>
                  </div>
                  <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__utils-total-price'>
                    <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__utils-total-price__caption'>
                    Total:
                    </div>

                    <div class='${TOTAL_PRODUCT_PRICE_VALUE_CLASS}'>
                      ${(uniqCountArr[idx].count * price).toFixed(1)}${get_correct_currency()}
                    </div>
                  </div>
                  <div class='${BASKET_DIALOG_MAIN_CLASS}__product-item-content__utils-count'>
                  <quantity-counter value='${
                    uniqCountArr[idx].count
                  }' id='product-item-content__utils-count|${id}'></quantity-counter>   
                  </div>
                </div>
              </div>
            </div>
          `
      );

      handleSetUpTotalPrice();
      const allQuantityCountersNode = basketDialogNode.getElementsByTagName('quantity-counter');
      const allDeleteButtonsNodeArr = basketDialogNode.querySelectorAll(
        `.${BASKET_DIALOG_MAIN_CLASS}__product-item-content__header-delete-button`
      );

      allDeleteButtonsNodeArr.forEach((el) => {
        el.addEventListener('click', () => {
          // const [basketValue] = get_basket();
          const id = el.getAttribute('id-which-should-be-deleted');
          const basketDialogContentNode = document.querySelector('.' + BASKET_DIALOG_MAIN_CLASS);

          [...basketDialogContentNode.children].forEach((__) => {
            if (__.getAttribute('basket-product-id') === id) __.remove();
          });

          window.localStorage.setItem('basket', basketValue.filter((__) => __ !== id).join(' '));
        });
      });

      [...allQuantityCountersNode].forEach((el) => {
        el.children[0].addEventListener('click', () => {
          const id = el.id.split('|')[1];
          const [basketValue] = get_basket();

          if (basketValue.filter((__) => __ == id).length <= 1) return;

          const idxToRemove = basketValue.findIndex((__) => __ == id);

          window.localStorage.setItem('basket', basketValue.filter((__, idx) => idx !== idxToRemove).join(' '));
        });

        el.children[1].addEventListener(
          'DOMNodeInserted',
          (__) => {
            const parentNode = el.parentNode.parentNode;
            const price = Number.parseFloat(parentNode.children[0].children[1].textContent);
            const totalPrice = (+__.target.textContent * price).toFixed(1);
            parentNode.children[1].children[1].innerHTML = totalPrice + get_correct_currency();
          handleSetUpTotalPrice();

          },
          false
        );

        el.children[2].addEventListener('click', () => {
          const id = el.id.split('|')[1];

          const [basketValue] = get_basket();
          window.localStorage.setItem('basket', basketValue.join(' ') + ' ' + id);
        });
      });
    });
  });

  basketDialogCloseButtonNode.addEventListener('click', () => {
    isBasketDialogOpen = !isBasketDialogOpen;
    const basketClassList = basketDialogNode.classList;
    basketClassList.add('basket--closed');
    basketDialogMainNode.innerHTML = ``;
  });

  const [, basketLength] = get_basket();

  !!basketLength && basketNode.classList.add('with-label');
  basketNode.setAttribute('data-label', basketLength);
};
