import { randomUUID } from "node:crypto";
import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";
import Order from "../../models/order.schema.js";

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.state || !shippingAddress?.city || !shippingAddress?.street) return res.status(400).json({ success: false, message: "A complete shipping address is required" });
    if (!["OPAY", "PAY_ON_DELIVERY"].includes(paymentMethod)) return res.status(400).json({ success: false, message: "Unsupported payment method" });
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart?.items.length) return res.status(400).json({ success: false, message: "Your cart is empty" });
    const orderItems = [];
    let subtotal = 0;
    for (const line of cart.items) {
      const product = await Product.findOne({ _id: line.product, isPublished: true, isDeleted: false });
      const variant = product?.variants.id(line.variantId);
      if (!variant || !variant.isAvailable || variant.stock < line.quantity) return res.status(409).json({ success: false, message: `${product?.name || "An item"} is no longer available in the requested quantity` });
      const unitPrice = Number(variant.salePrice ?? variant.price);
      subtotal += unitPrice * line.quantity;
      orderItems.push({ product: product._id, variant: variant._id, name: product.name, image: product.thumbnail, color: variant.color, size: variant.size, sku: variant.sku, unitPrice, quantity: line.quantity });
    }
    const shippingFee = subtotal > 500000 ? 0 : 25000;
    const discount = subtotal >= 1000000 ? Math.round(subtotal * 0.1) : 0;
    const totalAmount = subtotal + shippingFee - discount;
    const order = await Order.create({ orderNumber: `TB-${Date.now()}-${randomUUID().slice(0, 5).toUpperCase()}`, user: req.user._id, items: orderItems, shippingAddress, subtotal, shippingFee, discount, totalAmount, paymentMethod, paymentStatus: "PENDING" });
    // Stock is reserved/decremented only after successful payment confirmation or COD confirmation, not at unverified checkout creation.
    res.status(201).json({ success: true, order, payment: paymentMethod === "OPAY" ? { status: "NOT_INITIALIZED", message: "OPay credentials and merchant API configuration are required before payment can be initialized." } : null });
  } catch (e) { next(e); }
};

export const getMyOrders = async (req, res, next) => {
  try { const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); res.json({ success: true, orders }); } catch (e) { next(e); }
};

export const getOrderById = async (req, res, next) => {
  try {
    const filter = { _id: req.params.orderId };
    if (req.user.role === "CUSTOMER") filter.user = req.user._id;
    const order = await Order.findOne(filter).populate("user", "firstName lastName email phone");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (e) { next(e); }
};
