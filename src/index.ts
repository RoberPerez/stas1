import { ExtendedClient } from './struct/Cliente';
import * as dotenv from 'dotenv';

dotenv.config();
new ExtendedClient().init();
