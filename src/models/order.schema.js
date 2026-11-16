import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  image: { type: String, default: "" },
  color: { type: String, default: "" },
  size: { type: String, default: "" },
  sku: { type: String, default: "" },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  shippingAddress: { fullName: String, phone: String, country: String, state: String, city: String, street: String, postalCode: String },
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: "NGN" },
  paymentMethod: { type: String, enum: ["OPAY", "PAY_ON_DELIVERY"], required: true },
  paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
  paymentReference: { type: String, default: "" },
  paymentProviderReference: { type: String, default: "" },
  orderStatus: { type: String, enum: ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"], default: "PENDING" },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
