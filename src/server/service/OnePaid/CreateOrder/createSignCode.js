import crypto from 'crypto';

const md5 = crypto.createHash('md5');

// secCode: securtiy code
export const createSignCode = (order, secCode) => {
  // step1: order by order key from A to Z ; connect keys by '&'
  console.log('==============md5==================')
  console.log(order);
  let signCodeString = '';
  Object.keys(order).sort().forEach(key => {
    signCodeString = signCodeString + '&' + key + '=' + order[key];
  })

  // step2: put the security code at the head
  signCodeString = 'SecurityCode=' + secCode + signCodeString;
  console.log(signCodeString);

  // step3: URL Encode
  let encodeString = encodeURIComponent(signCodeString);

  // step4: Encode String to lower case ; replace specific text with below rules
  encodeString = encodeString.toLowerCase();
  encodeString = encodeString.replace(/\%20/g, "+");
  encodeString = encodeString.replace(/\%2d/g, "-");
  encodeString = encodeString.replace(/\%5f/g, "_");
  encodeString = encodeString.replace(/\%2e/g, ".");
  encodeString = encodeString.replace(/\%21/g, "!");
  encodeString = encodeString.replace(/\%2a/g, "*");
  encodeString = encodeString.replace(/\%28/g, "(");
  encodeString = encodeString.replace(/\%29/g, ")");

  // step5: To MD5 hash
  const securityCode = md5.update(encodeString).digest('hex');
  console.log(securityCode);

  return securityCode;
}