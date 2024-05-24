import { extendTheme } from "@chakra-ui/react"
import {
    theme as chakraTheme,
  } from "@chakra-ui/react"

const {
    Heading,
    Button,
    Radio,
    Input,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Tooltip,
    FormError,
    Switch,
  } = chakraTheme.components;

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
  components: {
    Heading,
    Button,
    Radio,
    Input,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Tooltip,
    FormError,
    Switch,
  },
}

const theme = extendTheme({ config })

export default theme