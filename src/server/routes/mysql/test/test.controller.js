import testModule from './test.module'

/* Post */
const testPost = (req, res) => {
  const insertValues = req.body;
  testModule.createTest(insertValues).then((result) => {
    return res.send(result);
  }).catch((err) => {
    return res.send(err);
  })
}

/* Get */
const testGetAll = (req, res) => {
  testModule.selectAllTest().then((result) => {
    return res.send(result);
  }).catch((err) => {
    return res.send(err);
  })
}

/* Put */
const testPut = (req, res) => {
  const testName = req.params.testName;
  const updateValues = req.body;
  testModule.updateTest(updateValues, testName).then((result) => {
    return res.send(result);
  }).catch((err) => {
    return res.send(err);
  })
}

/* Delete */
const testDelete = (req, res) => {
  const testName = req.params.testName;
  testModule.deleteTest(testName).then((result) => {
    return res.send(result);
  }).catch((err) => {
    return res.send(err);
  })
}

export default {
  testPost,
  testGetAll,
  testPut,
  testDelete,
}