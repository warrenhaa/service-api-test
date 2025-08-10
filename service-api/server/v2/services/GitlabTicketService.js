import lodash from 'lodash';
import Logger from '../../utils/Logger';

const axios = require('axios');

class GitlabTicketService {
  static async sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  static async getIssue(params) {
    let issueExists = false;
    const searchKey = params.search;
    const labelName = params.labels;
    const comment = params.description;
    let searchUrl = process.env.GITLAB_TICKET_SEARCH_URL;
    try {
      // Replace placeholders in the URL
      searchUrl = searchUrl.replace('searchKey', searchKey);
      searchUrl = searchUrl.replace('labelName', labelName);
      const config = {
        url: searchUrl,
        method: 'get',
        headers: {
          'PRIVATE-TOKEN': process.env.GITLAB_TICKET_ACCESS_TOKEN,
        },
      };
      const res = await axios(config);

      if (res.data && res.data.length > 0) {
        const urls = lodash.map(res.data, 'web_url');
        if (urls.length > 0) { // Modified condition to include arrays with a single URL
          Promise.all(urls.slice(1).map(url => {
            const issue = url.split('-');
            let urlToClose = process.env.GITLAB_TICKET_CLOSE_URL;
            const { labels } = params;
            labels.push('duplicate')
            urlToClose = urlToClose.replace('issue', issue[4]);
            urlToClose = urlToClose.replace('labelName', labels);
            const data = {
              url: urlToClose,
              method: 'PUT',
              headers: {
                'PRIVATE-TOKEN': process.env.GITLAB_TICKET_CLOSE_URL,
              },
            };
            return axios(data)
              .then((response) => response.data)
              .catch((error) => {
                console.error(`Failed to closed ${url}: ${error.message}`);
                throw error;
              });
          }))
            .catch((error) => {
              console.error(`One or more requests failed: ${error.message}`);
              // Handle failure
            });
        }
        const issue = urls[0].split('-');
        let updateUrl = process.env.GITLAB_TICKET_UPDATE_URL;
        updateUrl = updateUrl.replace('issue', issue[3]);
        updateUrl = updateUrl.replace('comment', comment);

        const updateData = {
          url: updateUrl,
          method: 'post',
          headers: {
            'PRIVATE-TOKEN': process.env.GITLAB_TICKET_ACCESS_TOKEN,
          },
        };

        await axios(updateData);
        issueExists = true;
      }
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 414:
            Logger.info('Info-Error', { message: 'Request URI Too Long. Check the length of the request URL.', value: (searchUrl) });
            break;
          case 400:
            Logger.info('Info-Error', { message: 'Bad Request. Check the request payload and parameters.', value: (searchUrl) });
            break;
          case 429:
            // Implement exponential backoff
            console.log('Rate limited. Retrying after a delay...');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // 1-second delay (adjust as needed)
            return this.getIssue(params); // Retry the request
          default:
            Logger.error(`Unhandled Error. Status Code: ${statusCode}`);
        }
      } else {
        Logger.info('Network Error:', error.message);
      }
    }

    return issueExists;
  }

  static async createIssue(params) {
    try {
      const headerParams = {
        'PRIVATE-TOKEN': process.env.GITLAB_TICKET_ACCESS_TOKEN,
      };
      const response = await axios.post(process.env.GITLAB_TICKET_URL, {},
        {
          params,
          mode: 'no-cors',
          headers: headerParams,
          crossDomain: true,
        });
      return response.data;
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;

        switch (statusCode) {
          case 414:
            Logger.info('Info-Error', { message: 'Request URI Too Long. Check the length of the request URL.', value: (params) });
            break;
          case 400:
            Logger.info('Info-Error', { message: 'Bad Request. Check the request payload and parameters.', value: (params) });
            break;
          case 429:
            // Implement exponential backoff
            console.log('Rate limited. Retrying after a delay...');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // 1-second delay (adjust as needed)
            return this.createIssue(params); // Retry the request
          default:
            Logger.error(`Unhandled Error. Status Code: ${statusCode}`);
        }
      } else {
        console.error('Network Error:', error.message);
      }
    }
  }

  static async getClientIssue(params) {
    let issueExists = false;
    const searchKey = params.search;
    const labelName = params.labels;
    const comment = params.description;
    let searchUrl = process.env.GITLAB_SMART_HOME_TICKET_SEARCH_URL;
    searchUrl = searchUrl.replace('searchKey', searchKey);
    searchUrl = searchUrl.replace('labelName', labelName);
    const config = {
      url: searchUrl,
      method: 'get',
      headers: {
        'PRIVATE-TOKEN': process.env.GITLAB_TICKET_ACCESS_TOKEN,
      },
    };
    try {
      const res = await axios(config);
      if (res.data && res.data.length > 0) {
        const urls = lodash.map(res.data, 'web_url');

        if (urls.length > 0) { // Modified condition to include arrays with a single URL
          Promise.all(urls.slice(1).map(url => {
            const issue = url.split('-');
            let urlToClose = process.env.GITLAB_SMART_HOME_TICKET_CLOSE_URL;
            const { labels } = params;
            labels.push('duplicate')
            urlToClose = urlToClose.replace('issue', issue[4]);
            urlToClose = urlToClose.replace('labelName', labels);
            const data = {
              url: urlToClose,
              method: 'PUT',
              headers: {
                'PRIVATE-TOKEN': process.env.GITLAB_TICKET_ACCESS_TOKEN,
              },
            };
            return axios(data)
              .then((response) => response.data)
              .catch((error) => {
                console.error(`Failed to closed ${url}: ${error.message}`);
                throw error;
              });
          }))
            .catch((error) => {
              console.error(`One or more requests failed: ${error.message}`);
              // Handle failure
            });
        }
        const issue = urls[0].split('-');
        let updateUrl = process.env.GITLAB_SMART_HOME_TICKET_UPDATE_URL;
        updateUrl = updateUrl.replace('issue', issue[4]);
        updateUrl = updateUrl.replace('comment', comment);
        const data = {
          url: updateUrl,
          method: 'post',
          headers: {
            'PRIVATE-TOKEN': process.env.GITLAB_TICKET_ACCESS_TOKEN,
          },
        };

        await axios(data);
        issueExists = true;
      }
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 414:
            Logger.info('Info-Error', { message: 'Request URI Too Long. Check the length of the request URL.', value: (searchUrl) });
            break;
          case 400:
            Logger.info('Info-Error', { message: 'Bad Request. Check the request payload and parameters.', value: (searchUrl) });
            break;
          case 429:
            // Implement exponential backoff
            console.log('Rate limited. Retrying after a delay...');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // 1-second delay (adjust as needed)
            return this.getClientIssue(params); // Retry the request
          default:
            Logger.error(`Unhandled Error. Status Code: ${statusCode}`);
        }
      } else {
        Logger.info('Network Error:', error.message);
      }
    }
    return issueExists;
  }

  static async createClientIssue(params) {
    try {
      const headerParams = {
        'PRIVATE-TOKEN': process.env.GITLAB_TICKET_ACCESS_TOKEN,
      };
      const response = await axios.post(process.env.GITLAB_SMART_HOME_TICKET_URL, {}, {
        params,
        mode: 'no-cors',
        headers: headerParams,
        crossDomain: true,
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;

        switch (statusCode) {
          case 414:
            Logger.info('Info-Error', { message: 'Request URI Too Long. Check the length of the request URL.', value: (searchUrl) });
            break;
          case 400:
            Logger.info('Info-Error', { message: 'Bad Request. Check the request payload and parameters.', value: (searchUrl) });
            break;
          case 429:
            // Implement exponential backoff
            console.log('Rate limited. Retrying after a delay...');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // 1-second delay (adjust as needed)
            return this.createClientIssue(params); // Retry the request
          default:
            Logger.error(`Unhandled Error. Status Code: ${statusCode}`);
        }
      } else {
        console.error('Network Error:', error.message);
      }
    }
    return null;
  }
}
export default GitlabTicketService;
