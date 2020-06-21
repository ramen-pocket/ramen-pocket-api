import { MariadbConnection } from '../../database/mariadb-connection';
import { MariadbQueryAgent } from '../../database/mariadb-query-agent';
import { TagStore } from '../../repositories/tag/tag-store';
import { TagService } from '../../services/tag/tag-service';
import { GetTagsHandler } from '../../controllers/tag/get-tags-handler';
import { Guarantee } from '../../controllers/utils/guarantee';
import { handleError } from '../../controllers/sentinel';

const connection = new MariadbConnection();
const queryAgent = new MariadbQueryAgent(connection);
const tagStore = new TagStore(queryAgent);
const tagService = new TagService(tagStore);
const getTagsHandler = new GetTagsHandler(tagService);
const guarantee = new Guarantee(getTagsHandler);
guarantee.rescue(handleError);
guarantee.ensure(async () => await connection.disconnect());

export default guarantee.handle;
