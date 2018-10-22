import cheerio from 'cheerio';

// Step1
// Create One-Paid order
export const getOnePaidOrderKey = (body) => {
  const $ = cheerio.load(body);
  const result = {};
  result.action = '';
  result.data = {};
  const select_formAction = $("form")
  const select_formVal = $("form > input");
  const action = select_formAction.eq(0).attr('action');
  result.action = action;
  for(let i = 0; i < select_formVal.length; i++) {
    const name = select_formVal.eq(i).attr('name');
    const value = select_formVal.eq(i).attr('value');
    result.data[name] = value;
  }
  console.log(result);
  return result;
}

// Step2
// Send One-Paid's order info back to our server
export const sendDataBack = (body) => {
  const $ = cheerio.load(body);
  const result = {};
  const selector = $("form > input");
  for(let i = 0; i < selector.length; i++) {
    const name = selector.eq(i).attr('name');
    const value = selector.eq(i).attr('value');
    result[name] = value;
  }
  return result;
}