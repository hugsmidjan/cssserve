import o from 'ospec';

import redirectsFromFile from '../testing/redirectsFile.json';
import redirectsFromFile2 from '../testing/redirectsFile2.json';

import { parseRedirects } from './parseRedirects';

const redirects1 = {
  '/foo': '/bar',
  '/foo2': '/bar#30',
  '/foo3': '/bar#!',
};
const redirectsFile = 'testing/redirectsFile.json';
const redirectsFile2 = 'testing/redirectsFile2.json';

const redirectsFile_notThere = 'testing/non_existing.file';
const redirectsFile_notJSON = 'testing/public/index.html';
const redirectsFile_notMap = 'testing/cssserve-config.json';

o.spec('parseRedirects', () => {
  o('works', () => {
    o(parseRedirects(undefined)).equals(undefined)('default case');
    o(parseRedirects(redirects1)).deepEquals(redirects1)('redirects map');
    o(parseRedirects(undefined, redirectsFile)).deepEquals(redirectsFromFile)(
      'redirectsFile string'
    );
    o(parseRedirects(undefined, '')).equals(undefined)('redirectsFile empty string');
    o(parseRedirects(undefined, [redirectsFile])).deepEquals(redirectsFromFile)(
      'redirectsFile array'
    );
    o(parseRedirects(undefined, [redirectsFile, redirectsFile2])).deepEquals({
      ...redirectsFromFile,
      ...redirectsFromFile2,
    })('redirectsFile array');
    o(parseRedirects(undefined, [])).equals(undefined)('redirectsFile empty array');
    o(parseRedirects(undefined, [redirectsFile, '', ''])).deepEquals(redirectsFromFile)(
      'redirectsFile sparse array'
    );
  });

  o('merges contents of redirectFile into redirects', () => {
    o(parseRedirects(redirects1, redirectsFile)).deepEquals({
      ...redirects1,
      ...redirectsFromFile,
    });
    o(parseRedirects(redirects1, [redirectsFile, redirectsFile2])).deepEquals({
      ...redirects1,
      ...redirectsFromFile,
      ...redirectsFromFile2,
    });
  });

  o('throws on wonky input', () => {
    o(() => {
      // @ts-expect-error  (testing bad input)
      parseRedirects('foo');
    }).throws(Error)('non-map redirects (string)');

    o(() => {
      // @ts-expect-error  (testing bad input)
      parseRedirects('');
    }).throws(Error)('non-map redirects (empty string)');

    o(() => {
      // @ts-expect-error  (testing bad input)
      parseRedirects(['foo']);
    }).throws(Error)('non-map redirects (array)');

    o(() => {
      // @ts-expect-error  (testing bad input)
      parseRedirects(redirects1, { '/bogus': 'value' });
    }).throws(Error)('redirectsFile must be string');

    o(() => parseRedirects(redirects1, redirectsFile_notThere)).throws(Error)(
      'non-existent redirectsFile'
    );

    o(() => parseRedirects(redirects1, redirectsFile_notJSON)).throws(Error)(
      'non-JSON redirectsFile'
    );

    o(() => parseRedirects(redirects1, redirectsFile_notMap)).throws(Error)(
      'non-map redirectsFile'
    );
  });
});
