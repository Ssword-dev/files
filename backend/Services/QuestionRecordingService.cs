using System.Text.Json;
using Backend.Models;

namespace Backend.Services
{
    /// <summary>
    /// handles loading, saving and creating question records.
    /// business logic separated from data model.
    /// </summary>
    public static class QuestionRecordService
    {
        public static async Task SaveQuestionRecordAsync(QuestionRecordModel record, string directory)
        {
            if (!Directory.Exists(directory))
                Directory.CreateDirectory(directory);

            var path = ResolveQuestionRecordPath(directory, record.OwnerQuizId);

            await using var stream = File.Create(path);
            await JsonSerializer.SerializeAsync(stream, record);
        }

        public static QuestionRecordModel? QuestionRecordFromJson(string json)
        {
            return JsonSerializer.Deserialize<QuestionRecordModel>(json);
        }

        public static async Task<QuestionRecordModel?> QuestionRecordFromJsonAsync(Stream stream)
        {
            return await JsonSerializer.DeserializeAsync<QuestionRecordModel>(stream);
        }

        public static async Task<QuestionRecordModel?> LoadQuestionRecordFromDirectoryAsync(string directory, string quizId)
        {
            var path = ResolveQuestionRecordPath(directory, quizId);

            if (!File.Exists(path))
                return null;

            await using var stream = File.OpenRead(path);
            return await JsonSerializer.DeserializeAsync<QuestionRecordModel>(stream);
        }

        private static Exception? QuestionSanityChecks(QuestionModel model)
        {
            switch (model.Type)
            {
                default:
                    break;
            }

            return null;
        }

        /// <summary>
        /// Creates a new record with the given id and questions
        /// </summary>
        /// <param name="ownerQuizId">The id of the quiz that owns this questions. (as Guid)</param>
        /// <param name="questions">The questions</param>
        /// <returns>A new QuestionRecordModel</returns>
        public static QuestionRecordModel NewQuestionRecord(Guid ownerQuizId, QuestionModel[] questions)
        {

            // this one has skipped sanity check on the ownerQuizId because it
            // is already a guid. assumed to be valid.

            var violations = questions
                .Select(QuestionSanityChecks)
                .Where(v => v != null)
                .ToArray();

            if (violations.Length != 0)
            {
                throw violations[0]!;
            }

            return new QuestionRecordModel
            {
                OwnerQuizId = ownerQuizId.ToString(),
                Questions = questions
            };
        }


        /// <summary>
        /// Creates a new record with the given id and questions
        /// </summary>
        /// <param name="ownerQuizId">The id of the quiz that owns this questions. (as untrusted string)</param>
        /// <param name="questions">The questions</param>
        /// <returns>A new QuestionRecordModel</returns>
        public static QuestionRecordModel NewQuestionRecord(string ownerQuizId, QuestionModel[] questions)
        {
            if (ownerQuizId.Length != 36)
            {
                throw new ArgumentException("The owner id must be a valid GUID string");
            }

            var violations = questions
                .Select(QuestionSanityChecks)
                .Where(v => v != null)
                .ToArray();

            if (violations.Length != 0)
            {
                throw violations[0]!;
            }

            return new QuestionRecordModel
            {
                OwnerQuizId = ownerQuizId,
                Questions = questions
            };
        }

        public static string ResolveQuestionRecordPath(string directory, string quizId)
        {
            return Path.Combine(directory, $"{quizId}.json");
        }

        public static string ResolveQuestionRecordPath(string directory, Guid quizId)
        {
            return Path.Combine(directory, $"{quizId}.json");
        }
    }
}
