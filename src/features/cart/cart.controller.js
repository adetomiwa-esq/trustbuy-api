import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";

const serialize = (cart) => ({
  id: cart._id,
  items: cart.items.map((item) => {
    const p = item.product;
    const v = p?.variants?.id(item.variantId);
    return { id: item._id, productId: p?._id, variantId: item.variantId, title: p?.name, image: p?.thumbnail, price: v ? Number(v.salePrice ?? v.price) : 0, color: v?.color, size: v?.size, stock: v?.stock ?? 0, quantity: item.quantity, sku: v?.sku };
  }),
});

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({ path: "items.product", select: "name thumbnail variants isPublished isDeleted" });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ success: true, cart: serialize(cart) });
  } catch (e) { next(e); }
};

export const addCartItem = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const amount = Number(quantity);
    if (!productId || !variantId || !Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: "productId, variantId and a positive integer quantity are required" });
    const product = await Product.findOne({ _id: productId, isPublished: true, isDeleted: false });
    const variant = product?.variants.id(variantId);
    if (!variant || !variant.isAvailable) return res.status(404).json({ success: false, message: "Product option is unavailable" });
    if (amount > variant.stock) return res.status(409).json({ success: false, message: "Requested quantity exceeds available stock" });
    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id } }, { upsert: true, new: true });
    const existing = cart.items.find(i => String(i.product) === String(productId) && String(i.variantId) === String(variantId));
    if (existing) existing.quantity = Math.min(variant.stock, existing.quantity + amount);
    else cart.items.push({ product: productId, variantId, quantity: amount });
    await cart.save();
    await cart.populate({ path: "items.product", select: "name thumbnail variants isPublished isDeleted" });
    res.json({ success: true, cart: serialize(cart) });
  } catch (e) { next(e); }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart?.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: "Cart item not found" });
    const product = await Product.findById(item.product);
    const variant = product?.variants.id(item.variantId);
    if (!variant || quantity > variant.stock) return res.status(409).json({ success: false, message: "Requested quantity exceeds available stock" });
    item.quantity = quantity;
    await cart.save();
    await cart.populate({ path: "items.product", select: "name thumbnail variants" });
    res.json({ success: true, cart: serialize(cart) });
  } catch (e) { next(e); }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate({ path: "items.product", select: "name thumbnail variants" });
    res.json({ success: true, cart: serialize(cart) });
  } catch (e) { next(e); }
};
