import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from 'TestApp'
import authService from 'pages/auth/mock'


it('nopage', async () => {
  let wrapper
  await act(async () => {
    wrapper = await mount(
      <TestApp path="/nonexisting" />
    )
  })
  let title = wrapper.find('h1')
  expect(title.text()).toEqual('No Such Page')
  expect(authService.refresh).toHaveBeenCalled()
})
