import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;

  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
  STRIPE_SECRET_KEY: string;
}

export const envVarsSchema = joi
  .object({
    PORT: joi.number().default(3000),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
    STRIPE_SECRET_KEY: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  PORT: envVars.PORT,
  STRIPE_SUCCESS_URL: envVars.STRIPE_SUCCESS_URL,
  STRIPE_CANCEL_URL: envVars.STRIPE_CANCEL_URL,
  STRIPE_SECRET_KEY: envVars.STRIPE_SECRET_KEY,
};
