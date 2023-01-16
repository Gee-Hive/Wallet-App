import axios from 'axios';
const stripe = Stripe(
  'pk_test_51MCuAzFZhP4kx9OUEhhxjYCuEunldKYoV3MDCSSYVnpsNLavSQTlaFsPXbYiZ26SMQrcGcFneMPQhGtD4f9ezZLF00h2GPRtHA'
);

const makePayment = async (username) => {
  try {
    //get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/payment/checkout-session/${username}`
    );
    console.log(session);

    //now create checkout session
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(err);
    return err;
  }
};
