import isomorphicFetch from 'isomorphic-fetch';


export function getAuthToken() {
  // eslint-disable-next-line no-undef
  return window.localStorage.ImagineVRAuthToken;
}


export function isLoggedIn() {
  return Boolean(getAuthToken());
}


export function requireAuth(nextState, replace) {
  if (!isLoggedIn()) {
    replace('/landing');
  }
}


export function fetch(args) {
  const {
    url,
    body,
    method,
  } = args;
  const newbody = JSON.stringify(body);
  const newargs = {
    body: newbody,
    method: method || 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `JWT ${getAuthToken()}`,
    },
  };
  if (!isLoggedIn()) {
    delete newargs.headers.Authorization;
  }
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    newargs.headers['Content-Type'] = 'application/json';
  }
  return isomorphicFetch(url, newargs)
    .then(response => {
      const json = response.json();
      if (response.status >= 400) {
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
      return json;
    });
}


export function pathnameToBreadcrumbs(pathname) {
  let arg;
  const pathElements = [];
  const result = [];
  const crumbBlueprint = [];
  const breadcrumbItems = {
    upload: 'Upload',
    products: 'Products',
    manage: 'Manage',
    users: 'Users',
  };
  pathname.split('/').forEach(element => {
    if (element !== '') {
      pathElements.push(element);
    }
  });
  pathElements.forEach(element => {
    const elementIsCrumb = breadcrumbItems[element] !== undefined;
    if (elementIsCrumb) {
      if (arg) {
        crumbBlueprint.push({
          name: element,
          argument: arg,
        });
      } else {
        crumbBlueprint.push({
          name: element,
        });
      }
      arg = undefined;
    } else {
      arg = element;
    }
  });

  crumbBlueprint.forEach((element, index) => {
    const item = {
      name: breadcrumbItems[element.name],
      original: element.name,
      path: `/${element.name}`,
    };
    if (element.argument) {
      if (index === 1) {
        item.path = `${result[index - 1].path}/${element.argument}`;
      } else {
        item.path = `${result[index - 1].path}/${result[index - 1].original}/${element.argument}`;
      }
    }
    result.push(item);
  });
  return result;
}


export function round4(number) {
  return (number + 8) % 4;
}


export function pickCarousel(number) {
  return [round4(number - 1), round4(number), round4(number + 1)];
}


export function carouselData(index, data) {
  return pickCarousel(index).map(
    (i) => ({
      key: data[i],
      height: 200,
      width: 200,
      description: 'neki opis',
    })
  );
}
