export const get_product_component_variant = () =>     window.localStorage.getItem('productsViewVariant') === 'grid' ? 'special-product' : 'horizontal-product';