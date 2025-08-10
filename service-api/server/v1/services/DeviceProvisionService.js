const axios = require('axios');

class DeviceProvisionService {
  static async sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  static async deviceProvison(headerParams, form, tryCount) {
    return new Promise((resolve, reject) => {
      axios.post(process.env.DEVICE_PROVISION_URL, form,
        {
          mode: 'no-cors',
          headers: headerParams,
          crossDomain: true,
        }).then(async (result) => {
        if (result && result.data && result.data.statusCode === 408 && tryCount <= 6) {
          await this.sleep(5000);
          // if (result.data.body === '"Resource Busy!"' |) {
          tryCount += 1;
          await this.deviceProvison(headerParams, form, tryCount).then((result) => {
            resolve(result);
          }).catch((err) => {
            reject(err);
          });
          // } else {
          //   resolve(result);
          // }
        } else {
          resolve(result);
        }
      })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default DeviceProvisionService;
