import * as boxModule from './box.moudle';

export const boxGetGifts = async (req, res) => {
  try {
    const bid_array = req.body;
    let result = [];
    for(let idx = 0; idx < bid_array.length; idx++) {
      let b = bid_array[idx];
      let b_gift = await boxModule.selectBoxGifts(b.b_id);
      result.push({
        b_id: b.b_id,
        gifts: b_gift,
      });
    }
    return res.json({
      result,
    });
  } catch(err) {
    return res.send(err);
  }
}