const express = require("express");
const dotenv = require("dotenv");
const Farmer = require("./models/farmer");
const Vendor = require("./models/vendor");
const product = require("./models/product");
const Order = require("./models/order");
const cors = require("cors")
const axios = require("axios");
const { spawn, execSync } =  require("child_process");
const sendEmail = require("./utils/mailer")
const Stripe = require("stripe")
const flask = spawn("python", ["PricePrediction.py"]);
const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY)
const app = express();

app.use(express.json());
app.use(cors())
dotenv.config();

app.post("/smartmandi/register", async (req, res) => {
  try { 
    // const ID = generateID();
    const { role, ...userData } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    let newUser;
    if (role.toLowerCase() === "farmer") {
      newUser = new Farmer(userData);
    } else if (role.toLowerCase() === "vendor") {
      newUser = new Vendor(userData);
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    await newUser.save();
    res.status(201).json({
      message: `${role} registered successfully`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}
//send OTP
app.post('/smartmandi/user/sendOtp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const otp = generateOTP();
  otpStore[email] = otp;

  try {
    await sendEmail(
      email,
      `One time password`,
      `Your OTP is ${otp}`,
      `<p>Your OTP is <b>${otp}</b></p>`
    );
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/smartmandi/user/verifyOtp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  if (otpStore[email] === otp) {
    delete otpStore[email]; // clearing after success
    res.status(200).json({ status: true });
  } else {
    res.status(400).json({ status: false });
  }
});

//Update Password
app.put("/smartmandi/updatePassword", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const far = await Farmer.findOne({ email });
    if (far) {
      await Farmer.findByIdAndUpdate(far._id, { password }, { new: true });
      return res.json({ message: "Farmer password updated successfully" });
    }

    const ven = await Vendor.findOne({ email });
    if (ven) {
      await Vendor.findByIdAndUpdate(ven._id, { password }, { new: true });
      return res.json({ message: "Vendor password updated successfully" });
    }

    return res.status(404).json({ message: "Email-id not found" });

  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.put("/smartmandi/update/:role/:id", async (req, res) => {
  try {
    const { id, role} = req.params;
    const updateData = req.body;

    let model;
    if (role.toLowerCase() === "farmer") {
      model = Farmer;
    } else if (role.toLowerCase() === "vendor") {
      model = Vendor;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `${role} details updated successfully`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
});

app.get("/smartmandi/user/:role/:id", async (req, res) => {
  try {
    const { role, id } = req.params;
    let model;
    if (role.toLowerCase() === "farmer") {
      model = Farmer;
    } else if (role.toLowerCase() === "vendor") {
      model = Vendor;
    }else {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await model.findById(id);

    if (!user) {
      return res.status(404).json({ 
        message: `${role} not found` 
      });
    }

    // Send farmer details
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user details" });
  }
});

// farmer login api

app.post("/smartmandi/farmer/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const farmer = await Farmer.findOne({email}); 
    if( !farmer ){
      return res.status(400).json({ 
        message: `${email} not found` 
      });
    }
    if(password != farmer.password){
      return res.status(400).json({ 
        message: `Entered password is wrong` 
      });
    }
    
    res.status(200).json({Id:farmer._id,name:farmer.fullName});
  } catch (err) {
    res.status(500).json({ error: "Error fetching user details" });
  }
});

// vendor login api

app.post("/smartmandi/vendor/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({email}); 
    if( !vendor ){
      return res.status(400).json({ 
        message: `${email} not found` 
      });
    }
    if(password != vendor.password){
      return res.status(400).json({ 
        message: `password is wrong` 
      });
    }
    res.status(200).json({Id:vendor._id,name:vendor.fullName});
  } catch (err) {
    res.status(500).json({ error: "Error fetching user details" });
  }
});

// order related apis
//create a new order
app.post("/smartmandi/order/createOrder", async (req, res) => {
  try {
    const newOrder = new Order(req.body);

    await newOrder.save();
    res.status(201).json({
      message: `order placed successfully`
    });
    let status;
    const updateData = req.body.orderDetail;
    await Order.findByIdAndUpdate(req.body.orderId,updateData, { new: true });
    
    const productData = await product.findById(newOrder.productId);

    if(!productData)
      return res.status(404).json({ message: "Not able to update quantity" });
    const newQty = productData.QuantityAvailable-newOrder.quantity;
    if(newQty<=productData.MinimumOrderQuantity)
        status="Low Stock";
    await product.findByIdAndUpdate(newOrder.productId,{QuantityAvailable:newQty,Status:status})
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get all orders related to farmer

app.get("/smartmandi/farmer/getRecentOrders/:farmerId", async (req, res) => {
  try {
    
    const orderList = await Order.find({farmerId:req.params.farmerId}).populate("productId","ProductName PricePerUnit").populate("vendorId","fullName phoneNumber landmark city district pincode email")
    .sort({ updatedAt : -1 })
    .limit(2);
    if (orderList.length==0) {
      return res.status(404).json({ 
        message: `No orders found` 
      });
    }

    // Send order listing to farmer
    res.json(orderList);
  } catch (err) {
    res.status(500).json({ error: "Error fetching order details" });
  }
});

app.get("/smartmandi/farmer/getAllOrders/:farmerId", async (req, res) => {
  try {
    
    const orderList = await Order.find({farmerId:req.params.farmerId}).populate("productId","ProductName PricePerUnit").populate("vendorId","fullName phoneNumber landmark city district pincode email");
    if (orderList.length==0) {
      return res.status(200).json({ 
        message: `No orders found` 
      });
    }

    // Send order listing to farmer
    res.json(orderList);
  } catch (err) {
    res.status(500).json({ error: "Error fetching order details" });
  }
});

//get all orders related to vendor
app.get("/smartmandi/vendor/getAllOrders/:vendorId", async (req, res) => {
  try {
    
    const orderList = await Order.find({vendorId:req.params.vendorId}).populate("productId").populate("productId","ProductName");
    if (orderList.length==0) {
      return res.status(200).json({ 
        message: `No orders found` 
      });
    }

    // Send order listing to farmer
    res.json(orderList);
  } catch (err) {
    res.status(500).json({ error: "Error fetching order details" });
  }
});

//update order details
app.put("/smartmandi/order/updateOrder", async (req, res) => {
  try {
    let status;
    const updateData = req.body.orderDetail;
    await Order.findByIdAndUpdate(req.body.orderId,updateData, { new: true });
    
    // Send order listing to farmer
    res.json({message:"order details updated successfully"});
  } catch (err) {
    res.status(500).json({ error: "Error fetching order details" });
  }
});

app.delete("/smartmandi/order/delete/:id", async (req, res) => {
  try {
    let status;
    const {id} = req.params;
    const updated = await Order.findByIdAndDelete(id,  { new: true });
    console.log("order",updated)
    if (!updated) {
      return res.status(404).json({ message: "Order does not exist" });
    }
    const productData = await product.findById(updated.productId);

    if(!productData)
      return res.status(404).json({ message: "Not able to update quantity" });
    const newQty = productData.QuantityAvailable+updated.quantity;
    if(newQty>productData.MinimumOrderQuantity)
        status="Available";
    await product.findByIdAndUpdate(updated.productId,{QuantityAvailable:newQty,Status:status})
    res.status(200).json({
      message: 'Order details deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// product related apis
//add new product
app.post("/smartmandi/product/addNewProduct", async (req, res) => {
  try {
    let newProduct;
    newProduct = new product(req.body);

    await newProduct.save();
    res.status(201).json({
      message: 'product added successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/smartmandi/product/getProductDetails/:id", async (req, res) => {
  try {
    const product_id = req.params.id;

    const product_details = await product.findById(product_id);
    if (!product_details) {
      return res.status(404).json({ message: "product details are not found" });
    }

    res.status(200).json(product_details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/smartmandi/product/getAllProducts", async (req, res) => {
  try {
    
    const products = await product.find().populate({path:"FarmerID",select:"fullName city district"});
    if (!products) {
      return res.status(404).json({ message: "product details are not found" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/smartmandi/product/update/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const updateProduct = req.body;

    const updated = await product.findByIdAndUpdate(id, updateProduct, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: 'product details updated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/smartmandi/product/delete/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const updated = await product.findByIdAndDelete(id,  { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    res.status(200).json({
      message: 'product details deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/smartmandi/product/ProductListing/:id", async (req, res) => {
  try {
    const farmer_id = req.params.id;

    const fetched = await product.find({FarmerID : farmer_id});
    if (fetched.length === 0) {
      return res.status(404).json({ message: "Their is no listing found for this farmer" });
    }

    res.status(200).json({
      message: "Product listings fetched Successfully",
      fetched
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/smartmandi/order/giveRating", async (req, res) => {
  try {
    const {orderId,rating} = req.body;

    const updatedProductRating = await Order.findByIdAndUpdate(orderId,{rating:rating},{new:true});
    if (!updatedProductRating) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product rating added Successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/smartmandi/product/getFeaturedProducts/:vendorId", async (req, res) => {
  try {
    const vendor_Id = req.params.vendorId;

    const vendor = await Vendor.findById(vendor_Id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    const vendorDistrict = vendor.district;
    const featuredProducts = await product.aggregate(
      [
        {
          $lookup:{
            from: "farmers",
            localField:"FarmerID",
            foreignField:"_id",
            as:"farmerDetails"
          }
          
        },
        {
          $unwind:"$farmerDetails"
        },
        {
          $match:{
            $expr:{
              $eq:[
                {
                  $toLower:"$farmerDetails.district"
                },
                {
                  $toLower:vendorDistrict
                }
              ]
            }
          }
        },
        {
          $sort:{
            PricePerUnit:1,
          }
        },
        {
          $project:{
            farmerDetails:0
          }
        }
      ]
    )
    res.status(200).json({
      message: "Product listings fetched Successfully",
      featuredProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/smartmandi/getFarmerRating/:id", async (req, res) => {
  try {
    const {id} = req.params;
    console.log(id)
    const list = await Order.find({farmerId : id}).populate("rating");

    if (!list || list.length === 0) {
      return res.status(404).json({ message: "No products found for this farmer" });
    }

    let avg=0, count = 0;
    const rating = list.map(p => p.rating);
    for (let i=0;i<rating.length;i++){
      if(rating[i] != undefined){
         avg+=rating[i];
         count++
        }
    }
    if (count === 0)
    {
      count=1
    }
    avg = avg/count;

    // Send farmer details
    res.json({farmerRating: avg});
  } catch (err) {
    res.status(500).json({ error: "No farmer found" });
  }
});

app.post("/api/get-price", async (req, res) => {
  try {
    const formData = new URLSearchParams();
    formData.append("quantity", req.body.quantity);
    formData.append("date", req.body.date);
    formData.append("name", req.body.name);

    const response = await axios.post("http://localhost:5001/form", formData);
    res.json(response.data);
  } catch (err) {
    console.error("Error calling Flask:", err.message);
    res.status(500).json({ error: "Internal server error in Flask" });
  }
});

app.post("/smartmandi/payment/checkout", async (req, res) => {
  try {
    const { vendorId, farmerId, productId, quantity, totalAmount, _id} = req.body;

    const Product = await product.findById(productId.toString());
    if (!Product) return res.status(404).json({ message: "Product not found" });

    const name = Product.ProductName;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: name,
              metadata: {
                productId: productId.toString(),
                vendorId: vendorId,
                farmerId: farmerId,
                orderId: _id
              },
            },
            unit_amount: totalAmount/quantity * 100,
          },
          quantity: quantity,
        },
      ],
      shipping_address_collection: {
        allowed_countries: [ 'IN' ]
      },
      mode: "payment",
      success_url: `${process.env.BACKEND_URL}/smartmandi/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/vendor/orders`,
      metadata: {
        vendorId: vendorId,
        orderId: _id.toString()
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/smartmandi/payment/success", async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const orderId = session.metadata.orderId;

    if (session.payment_status === "paid") {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "Paid" });
    }
    res.status(200).redirect(`${process.env.BASE_URL}/vendor/orders`);
  } catch (error) {
    console.error("Error in success route:", error);
    res.status(404).redirect(`${process.env.BASE_URL}/vendor/orders`);
  }
});


module.exports = app;