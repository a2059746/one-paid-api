import * as memberModule from './member.module';

export const memberGetReceiveAddr = async (req, res) => {
  const phone = req.params.phone;
  const tw_area = req.params.tw_area;
  try {
    const result = await memberModule.selectReceiveAddr(phone, tw_area);
    res.json({
      result,
    });
  } catch(err) {
    res.send(err);
  }
}